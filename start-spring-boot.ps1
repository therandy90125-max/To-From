# Spring Boot Backend Startup Script
# Spring Boot 백엔드 시작 스크립트

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Spring Boot Backend Starting..." -ForegroundColor Yellow
Write-Host "   Port: 8080" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ backend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
    Write-Host "현재 경로: $PSScriptRoot" -ForegroundColor Yellow
    pause
    exit 1
}

Set-Location -Path $backendPath

# Check for Maven Wrapper
$mvnw = ".\mvnw.cmd"
if (-not (Test-Path $mvnw)) {
    $mvnw = ".\mvnw"
    if (-not (Test-Path $mvnw)) {
        Write-Host "❌ Maven Wrapper를 찾을 수 없습니다!" -ForegroundColor Red
        Write-Host "Maven이 설치되어 있다면 'mvn spring-boot:run'을 사용하세요." -ForegroundColor Yellow
        pause
        exit 1
    }
}

Write-Host "✓ Maven Wrapper found" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Spring Boot server..." -ForegroundColor Yellow
Write-Host "This may take 10-30 seconds..." -ForegroundColor Gray
Write-Host ""

# Start Spring Boot
try {
    if ($mvnw -like "*.cmd") {
        & $mvnw spring-boot:run
    } else {
        bash $mvnw spring-boot:run
    }
} catch {
    Write-Host "❌ Spring Boot 시작 실패: $_" -ForegroundColor Red
    pause
    exit 1
}

