#!/bin/bash

# QuantaFolio Navigator - One-Command Startup Script
# 모든 서비스를 한 번에 시작하는 스크립트

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Functions
print_header() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}  QuantaFolio Navigator - Startup${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing=0
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "  Install from: https://docs.docker.com/get-docker/"
        missing=1
    else
        print_success "Docker found: $(docker --version)"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "  Install from: https://docs.docker.com/compose/install/"
        missing=1
    else
        if command -v docker-compose &> /dev/null; then
            print_success "Docker Compose found: $(docker-compose --version)"
        else
            print_success "Docker Compose found: $(docker compose version)"
        fi
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        echo "  Start Docker Desktop or Docker daemon"
        missing=1
    else
        print_success "Docker daemon is running"
    fi
    
    if [ $missing -eq 1 ]; then
        exit 1
    fi
    
    echo ""
}

# Check port conflicts
check_ports() {
    print_info "Checking for port conflicts..."
    
    local ports=(5000 8080 5173 8082 9092)
    local conflicts=0
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || \
           netstat -an 2>/dev/null | grep -q ":$port.*LISTEN" || \
           ss -tuln 2>/dev/null | grep -q ":$port"; then
            print_warning "Port $port is already in use"
            conflicts=1
        else
            print_success "Port $port is available"
        fi
    done
    
    if [ $conflicts -eq 1 ]; then
        echo ""
        print_warning "Some ports are in use. This may cause issues."
        echo "  To stop conflicting services, run: ./stop.sh"
        echo "  Or manually stop services using these ports"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo ""
}

# Check .env file
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        if [ -f .env.example ]; then
            print_info "Creating .env from .env.example..."
            cp .env.example .env
            print_warning "Please edit .env and add your ALPHA_VANTAGE_API_KEY"
            echo ""
            read -p "Press Enter to continue after editing .env (or Ctrl+C to exit)..."
        else
            print_error ".env.example not found. Please create .env manually"
            exit 1
        fi
    else
        print_success ".env file found"
    fi
    echo ""
}

# Start services
start_services() {
    print_info "Starting all services..."
    echo ""
    
    # Determine docker-compose command
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi
    
    # Build and start
    $DOCKER_COMPOSE up -d --build
    
    echo ""
    print_success "Services started! Waiting for health checks..."
    echo ""
}

# Wait for health checks
wait_for_health() {
    print_info "Waiting for services to be healthy..."
    echo ""
    
    local max_wait=120  # 2 minutes
    local elapsed=0
    local interval=5
    
    while [ $elapsed -lt $max_wait ]; do
        local all_healthy=1
        
        # Check Flask
        if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
            print_success "Flask (port 5000) is healthy"
        else
            all_healthy=0
            echo -n "."
        fi
        
        # Check Spring Boot
        if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
            print_success "Spring Boot (port 8080) is healthy"
        else
            all_healthy=0
            echo -n "."
        fi
        
        # Check Frontend
        if curl -sf http://localhost:5173 > /dev/null 2>&1; then
            print_success "Frontend (port 5173) is healthy"
        else
            all_healthy=0
            echo -n "."
        fi
        
        if [ $all_healthy -eq 1 ]; then
            echo ""
            return 0
        fi
        
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    echo ""
    print_warning "Some services may still be starting..."
    print_info "Check logs with: docker-compose logs -f"
    return 1
}

# Show status
show_status() {
    echo ""
    print_info "Service Status:"
    echo ""
    
    if command -v docker-compose &> /dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Service URLs:${NC}"
    echo -e "  Frontend:     ${GREEN}http://localhost:5173${NC}"
    echo -e "  Spring Boot:  ${GREEN}http://localhost:8080${NC}"
    echo -e "  Flask:        ${GREEN}http://localhost:5000${NC}"
    echo -e "  H2 Console:   ${GREEN}http://localhost:8082${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    print_info "View logs: docker-compose logs -f"
    print_info "Stop all:  ./stop.sh"
    echo ""
}

# Main execution
main() {
    print_header
    
    check_prerequisites
    check_ports
    check_env
    start_services
    wait_for_health
    show_status
    
    print_success "All services are running!"
    echo ""
}

# Run main function
main

