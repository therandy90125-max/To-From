# 🐳 Complete Docker Setup - All Files

This document contains the complete code for all Docker-related files.

---

## 📄 docker-compose.yml

```yaml
version: '3.8'

services:
  # 1. H2 Database (개발용)
  database:
    image: oscarfonts/h2:latest
    container_name: quantafolio-db
    ports:
      - "8082:8082"   # H2 Console
      - "9092:9092"   # H2 TCP
    environment:
      H2_OPTIONS: -ifNotExists
    volumes:
      - ./data/h2:/opt/h2-data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8082"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - quantafolio-network

  # 2. Flask Quantum Service
  quantum-service:
    build:
      context: ./python-backend
      dockerfile: Dockerfile
    container_name: quantafolio-quantum
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
      - ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY:-}
    volumes:
      - ./python-backend:/app
      - /app/__pycache__
    command: python app.py
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:5000/api/health').raise_for_status()"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    depends_on:
      database:
        condition: service_healthy
    networks:
      - quantafolio-network

  # 3. Spring Boot Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: quantafolio-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_DATASOURCE_URL=jdbc:h2:tcp://database:9092/mem:quantafolio
      - SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver
      - SPRING_DATASOURCE_USERNAME=sa
      - SPRING_DATASOURCE_PASSWORD=
      - FLASK_API_URL=http://quantum-service:5000
      - ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY:-}
    volumes:
      - ./backend:/app
      - /app/target
    depends_on:
      quantum-service:
        condition: service_healthy
      database:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 60s
    networks:
      - quantafolio-network

  # 4. React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: quantafolio-frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_BACKEND_URL=http://localhost:8080
      - VITE_FLASK_URL=http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules  # Prevent overwriting
    command: npm run dev -- --host
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - quantafolio-network

networks:
  quantafolio-network:
    name: quantafolio-network
    driver: bridge

volumes:
  h2-data:
    driver: local
```

---

## 📄 python-backend/Dockerfile

```dockerfile
# Flask Quantum Service Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
    CMD python -c "import requests; requests.get('http://localhost:5000/api/health').raise_for_status()" || exit 1

# Run Flask application
CMD ["python", "app.py"]
```

---

## 📄 backend/Dockerfile

```dockerfile
# Spring Boot Backend Dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=60s \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 📄 frontend/Dockerfile

```dockerfile
# React Frontend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Health check (Vite dev server)
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=20s \
    CMD node -e "require('http').get('http://localhost:5173', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run development server
CMD ["npm", "run", "dev", "--", "--host"]
```

---

## 📄 start.sh

See `start.sh` file in project root.

## 📄 stop.sh

See `stop.sh` file in project root.

---

**All files are ready!** 🎉

