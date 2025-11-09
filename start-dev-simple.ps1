# start-dev-simple.ps1

Write-Host "🚀 QuantaFolio Navigator - Starting All Services..." -ForegroundColor Cyan

# 1. Quantum Service (Flask)
Write-Host "`n[1/3] Starting Flask Quantum Service (Port 5000)..." -ForegroundColor Yellow
$flaskPath = Join-Path $PSScriptRoot "python-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$flaskPath'; python app.py"
Start-Sleep -Seconds 3

# 2. Backend (Spring Boot)
Write-Host "[2/3] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 5

# 3. Frontend (React + Vite)
Write-Host "[3/3] Starting React Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:8080" -ForegroundColor Cyan
Write-Host "Quantum:   http://localhost:5000" -ForegroundColor Cyan

