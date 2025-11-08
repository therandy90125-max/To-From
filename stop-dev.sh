#!/bin/bash

# QuantaFolio Navigator - Stop Development Services
# 개발 모드 서비스 중지

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}  QuantaFolio Navigator - Dev Shutdown${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_header

# Stop Flask
if [ -f /tmp/quantafolio-flask.pid ]; then
    FLASK_PID=$(cat /tmp/quantafolio-flask.pid)
    if kill -0 $FLASK_PID 2>/dev/null; then
        kill $FLASK_PID
        print_success "Flask stopped (PID: $FLASK_PID)"
    else
        print_info "Flask was not running"
    fi
    rm -f /tmp/quantafolio-flask.pid
else
    print_info "Flask PID file not found"
fi

# Stop Spring Boot
if [ -f /tmp/quantafolio-spring.pid ]; then
    SPRING_PID=$(cat /tmp/quantafolio-spring.pid)
    if kill -0 $SPRING_PID 2>/dev/null; then
        kill $SPRING_PID
        print_success "Spring Boot stopped (PID: $SPRING_PID)"
    else
        print_info "Spring Boot was not running"
    fi
    rm -f /tmp/quantafolio-spring.pid
else
    print_info "Spring Boot PID file not found"
fi

# Stop Frontend
if [ -f /tmp/quantafolio-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/quantafolio-frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        print_success "Frontend stopped (PID: $FRONTEND_PID)"
    else
        print_info "Frontend was not running"
    fi
    rm -f /tmp/quantafolio-frontend.pid
else
    print_info "Frontend PID file not found"
fi

# Kill by port (fallback)
for port in 5000 8080 5173; do
    PID=$(lsof -ti:$port 2>/dev/null || netstat -tuln 2>/dev/null | grep ":$port" | awk '{print $NF}' | cut -d'/' -f1)
    if [ ! -z "$PID" ]; then
        kill $PID 2>/dev/null && print_info "Killed process on port $port"
    fi
done

echo ""
print_success "All development services stopped!"
echo ""

