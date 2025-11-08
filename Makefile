# Makefile for Docker Compose Management
# Docker Compose 관리를 위한 Makefile

.PHONY: help up down restart logs build clean

help:
	@echo "QuantaFolio Navigator - Docker Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - Show all logs"
	@echo "  make build       - Build all images"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make ps          - Show running containers"
	@echo "  make health      - Check health of all services"

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

build:
	docker-compose build

clean:
	docker-compose down -v --rmi all

ps:
	docker-compose ps

health:
	@echo "Checking health of all services..."
	@curl -s http://localhost:5000/api/health && echo " ✅ Flask" || echo " ❌ Flask"
	@curl -s http://localhost:8080/actuator/health && echo " ✅ Spring Boot" || echo " ❌ Spring Boot"
	@curl -s http://localhost:5173 > /dev/null && echo " ✅ Frontend" || echo " ❌ Frontend"

rebuild:
	docker-compose build --no-cache
	docker-compose up -d

