# start-spring-boot.ps1
# Spring Boot 백엔드 시작 스크립트

Write-Host "[INFO] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# 현재 디렉토리가 backend인지 확인
if (-not (Test-Path "pom.xml")) {
    Write-Host "[ERROR] pom.xml not found. Please run this script from the backend directory." -ForegroundColor Red
    exit 1
}

# Maven Wrapper 확인
if (Test-Path "mvnw.cmd") {
    Write-Host "[OK] Using Maven Wrapper (mvnw.cmd)" -ForegroundColor Green
    .\mvnw.cmd spring-boot:run
} elseif (Test-Path "mvnw") {
    Write-Host "[OK] Using Maven Wrapper (mvnw)" -ForegroundColor Green
    .\mvnw spring-boot:run
} else {
    Write-Host "[WARNING] Maven Wrapper not found. Using system Maven..." -ForegroundColor Yellow
    mvn spring-boot:run
}

