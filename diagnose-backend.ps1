Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Backend Connection Diagnostics" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check if services are running
Write-Host "[1/5] Checking Running Processes..." -ForegroundColor Yellow
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue

if ($javaProcesses) {
    Write-Host "  ✅ Java processes found: $($javaProcesses.Count)" -ForegroundColor Green
    $javaProcesses | ForEach-Object { Write-Host "     PID: $($_.Id) - $($_.ProcessName)" -ForegroundColor Gray }
} else {
    Write-Host "  ❌ No Java processes found (Spring Boot not running)" -ForegroundColor Red
}

if ($nodeProcesses) {
    Write-Host "  ✅ Node processes found: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  ❌ No Node processes found (Frontend not running)" -ForegroundColor Red
}

if ($pythonProcesses) {
    Write-Host "  ✅ Python processes found: $($pythonProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  ❌ No Python processes found (Flask not running)" -ForegroundColor Red
}

Write-Host ""

# 2. Check ports
Write-Host "[2/5] Checking Ports..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port8080) {
    Write-Host "  ✅ Port 8080 is in use (Spring Boot)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 8080 is NOT in use" -ForegroundColor Red
}

if ($port5000) {
    Write-Host "  ✅ Port 5000 is in use (Flask)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 5000 is NOT in use" -ForegroundColor Red
}

if ($port5173) {
    Write-Host "  ✅ Port 5173 is in use (Frontend)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 5173 is NOT in use" -ForegroundColor Red
}

Write-Host ""

# 3. Test HTTP connections
Write-Host "[3/5] Testing HTTP Connections..." -ForegroundColor Yellow

# Spring Boot
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Spring Boot (8080): RESPONDING" -ForegroundColor Green
    Write-Host "     Status: $($backendResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Spring Boot (8080): NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Flask
try {
    $flaskResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Flask (5000): RESPONDING" -ForegroundColor Green
    Write-Host "     Status: $($flaskResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Flask (5000): NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Frontend (5173): RESPONDING" -ForegroundColor Green
    Write-Host "     Status: $($frontendResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Frontend (5173): NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# 4. Check backend directory
Write-Host "[4/5] Checking Backend Directory..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    Write-Host "  ✅ Backend directory exists" -ForegroundColor Green
    
    $mvnw = Join-Path $backendPath "mvnw.cmd"
    if (Test-Path $mvnw) {
        Write-Host "  ✅ Maven wrapper found" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Maven wrapper NOT found" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Backend directory NOT found at: $backendPath" -ForegroundColor Red
}

Write-Host ""

# 5. Recommendations
Write-Host "[5/5] Recommendations..." -ForegroundColor Yellow
if (-not $javaProcesses) {
    Write-Host "  🔧 Start Spring Boot:" -ForegroundColor Yellow
    Write-Host "     cd backend" -ForegroundColor Gray
    Write-Host "     .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
}

if (-not $pythonProcesses) {
    Write-Host "  🔧 Start Flask:" -ForegroundColor Yellow
    Write-Host "     cd python-backend" -ForegroundColor Gray
    Write-Host "     .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "     python app.py" -ForegroundColor Gray
}

if (-not $nodeProcesses) {
    Write-Host "  🔧 Start Frontend:" -ForegroundColor Yellow
    Write-Host "     cd frontend" -ForegroundColor Gray
    Write-Host "     npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Quick Fix: Run start-all.ps1" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

