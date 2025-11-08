#!/bin/bash

# QuantaFolio Navigator - Stop All Services
# 모든 서비스를 중지하는 스크립트

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_header() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}  QuantaFolio Navigator - Shutdown${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Determine docker-compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

print_header

print_info "Stopping all services..."
$DOCKER_COMPOSE down

echo ""
print_success "All services stopped!"

# Optional: Remove volumes
read -p "Remove volumes? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing volumes..."
    $DOCKER_COMPOSE down -v
    print_success "Volumes removed"
fi

echo ""
print_info "To start again, run: ./start.sh"
echo ""

