# start-dev.ps1
# QuantaFolio Navigator - Development Environment Launcher (Maven Edition)

$ErrorActionPreference = "Continue"

# 프로젝트 루트 경로 설정
$projectRoot = $PSScriptRoot
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Write-Host "[INFO] QuantaFolio Navigator - Starting All Services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot" -ForegroundColor Gray

# 1. Quantum Service (Flask) - Port 5000
Write-Host "`n[1/3] Starting Flask Quantum Service (Port 5000)..." -ForegroundColor Yellow
$quantumPath = Join-Path $projectRoot "python-backend"

if (Test-Path $quantumPath) {
    $flaskCmd = @"
Set-Location '$quantumPath'
Write-Host '================================================' -ForegroundColor Cyan
Write-Host '   Flask Quantum Service (Port 5000)' -ForegroundColor Cyan
Write-Host '================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Quantum Service Starting...' -ForegroundColor Green
python app.py
"@
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $flaskCmd
    Write-Host "[OK] Quantum service launched" -ForegroundColor Green
} else {
    Write-Host "[ERROR] python-backend directory not found!" -ForegroundColor Red
}

Start-Sleep -Seconds 3

# 2. Backend (Spring Boot + Maven) - Port 8080
Write-Host "`n[2/3] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
$backendPath = Join-Path $projectRoot "backend"

if (Test-Path $backendPath) {
    $mvnwPath = Join-Path $backendPath "mvnw.cmd"
    if (Test-Path $mvnwPath) {
        $springCmd = @"
Set-Location '$backendPath'
Write-Host '================================================' -ForegroundColor Cyan
Write-Host '   Spring Boot Backend (Port 8080)' -ForegroundColor Cyan
Write-Host '================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Spring Boot Starting...' -ForegroundColor Green
.\mvnw.cmd spring-boot:run
"@
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $springCmd
        Write-Host "[OK] Backend launched with Maven Wrapper" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] mvnw.cmd not found in backend directory!" -ForegroundColor Yellow
        Write-Host "  Trying with system Maven..." -ForegroundColor Yellow
        $springCmd = @"
Set-Location '$backendPath'
Write-Host 'Spring Boot Starting...' -ForegroundColor Green
mvn spring-boot:run
"@
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $springCmd
    }
} else {
    Write-Host "[ERROR] backend directory not found!" -ForegroundColor Red
}

Start-Sleep -Seconds 8

# 3. Frontend (React + Vite) - Port 5173
Write-Host "`n[3/3] Starting React Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $projectRoot "frontend"

if (Test-Path $frontendPath) {
    $reactCmd = @"
Set-Location '$frontendPath'
Write-Host '================================================' -ForegroundColor Cyan
Write-Host '   React Frontend (Port 5173)' -ForegroundColor Cyan
Write-Host '================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Frontend Starting...' -ForegroundColor Green
npm run dev
"@
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $reactCmd
    Write-Host "[OK] Frontend launched" -ForegroundColor Green
} else {
    Write-Host "[ERROR] frontend directory not found!" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] All services started!" -ForegroundColor Green
Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "  Quantum:   http://localhost:5000" -ForegroundColor White
Write-Host "`nHealth Check:" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host "`nH2 Console:" -ForegroundColor Cyan
Write-Host "  Database:  http://localhost:8080/h2-console" -ForegroundColor White
Write-Host "`nPress Ctrl+C in each window to stop services" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
