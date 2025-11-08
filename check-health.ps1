Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  QuantaFolio Health Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Backend (Spring Boot) - Port 8080
Write-Host "[1/3] Checking Backend (Spring Boot) - Port 8080..." -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -ErrorAction Stop -TimeoutSec 3
    Write-Host "  ✅ Backend: HEALTHY" -ForegroundColor Green
    Write-Host "     Status: $($backend.status)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Backend: NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Python Backend (Flask) - Port 5000
Write-Host "[2/3] Checking Python Backend (Flask) - Port 5000..." -ForegroundColor Yellow
try {
    $pythonBackend = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop -TimeoutSec 3
    Write-Host "  ✅ Python Backend: HEALTHY" -ForegroundColor Green
    if ($pythonBackend.service) {
        Write-Host "     Service: $($pythonBackend.service)" -ForegroundColor Gray
    }
    Write-Host "     Status: $($pythonBackend.status)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Python Backend: NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Frontend (React + Vite) - Port 5173
Write-Host "[3/3] Checking Frontend (React + Vite) - Port 5173..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -ErrorAction Stop -TimeoutSec 3
    Write-Host "  ✅ Frontend: RUNNING" -ForegroundColor Green
    Write-Host "     Status Code: $($frontend.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Frontend: NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Service URLs:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Frontend:       http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:        http://localhost:8080" -ForegroundColor White
Write-Host "  Python Backend: http://localhost:5000" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

