#!/bin/bash

# QuantaFolio Navigator - Development Mode (Non-Docker)
# Docker 없이 로컬에서 서비스 시작

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_header() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}  QuantaFolio Navigator - Dev Mode${NC}"
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
    
    # Python
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        print_error "Python is not installed"
        exit 1
    else
        print_success "Python found"
    fi
    
    # Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed (required for Spring Boot)"
        exit 1
    else
        print_success "Java found: $(java -version 2>&1 | head -n 1)"
    fi
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    else
        print_success "Node.js found: $(node --version)"
    fi
    
    # Maven
    if ! command -v mvn &> /dev/null && [ ! -f "$SCRIPT_DIR/backend/mvnw" ]; then
        print_error "Maven is not installed and mvnw not found"
        exit 1
    else
        print_success "Maven found"
    fi
    
    echo ""
}

# Start Flask
start_flask() {
    print_info "Starting Flask (port 5000)..."
    cd "$SCRIPT_DIR/python-backend"
    
    if [ ! -d "venv" ]; then
        print_info "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -q -r requirements.txt
    
    python app.py &
    FLASK_PID=$!
    echo $FLASK_PID > /tmp/quantafolio-flask.pid
    
    print_success "Flask started (PID: $FLASK_PID)"
    sleep 3
    cd "$SCRIPT_DIR"
}

# Start Spring Boot
start_spring_boot() {
    print_info "Starting Spring Boot (port 8080)..."
    cd "$SCRIPT_DIR/backend"
    
    if [ -f "mvnw" ]; then
        chmod +x mvnw
        ./mvnw spring-boot:run &
    else
        mvn spring-boot:run &
    fi
    
    SPRING_PID=$!
    echo $SPRING_PID > /tmp/quantafolio-spring.pid
    
    print_success "Spring Boot started (PID: $SPRING_PID)"
    print_warning "Spring Boot may take 30-60 seconds to start"
    cd "$SCRIPT_DIR"
}

# Start Frontend
start_frontend() {
    print_info "Starting React Frontend (port 5173)..."
    cd "$SCRIPT_DIR/frontend"
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/quantafolio-frontend.pid
    
    print_success "Frontend started (PID: $FRONTEND_PID)"
    cd "$SCRIPT_DIR"
}

# Main
main() {
    print_header
    check_prerequisites
    
    start_flask
    start_spring_boot
    start_frontend
    
    echo ""
    print_success "All services started in development mode!"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Service URLs:${NC}"
    echo -e "  Frontend:     ${GREEN}http://localhost:5173${NC}"
    echo -e "  Spring Boot:  ${GREEN}http://localhost:8080${NC}"
    echo -e "  Flask:        ${GREEN}http://localhost:5000${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    print_info "To stop services, run: ./stop-dev.sh"
    print_info "Or kill PIDs: $(cat /tmp/quantafolio-*.pid 2>/dev/null | tr '\n' ' ')"
    echo ""
}

main

