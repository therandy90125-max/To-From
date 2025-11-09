Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Backend Connection Test" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Process Check
Write-Host "[1/6] Checking Running Processes..." -ForegroundColor Yellow
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($javaProcesses) {
    Write-Host "  OK Java processes: $($javaProcesses.Count)" -ForegroundColor Green
    $javaProcesses | ForEach-Object { Write-Host "     PID: $($_.Id)" -ForegroundColor Gray }
} else {
    Write-Host "  FAIL Java processes: None" -ForegroundColor Red
}

if ($pythonProcesses) {
    Write-Host "  OK Python processes: $($pythonProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  FAIL Python processes: None" -ForegroundColor Red
}

if ($nodeProcesses) {
    Write-Host "  OK Node processes: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  FAIL Node processes: None" -ForegroundColor Red
}

Write-Host ""

# 2. Port Check
Write-Host "[2/6] Checking Ports..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
$port5174 = Get-NetTCPConnection -LocalPort 5174 -State Listen -ErrorAction SilentlyContinue

if ($port8080) {
    Write-Host "  OK Port 8080: LISTENING" -ForegroundColor Green
} else {
    Write-Host "  FAIL Port 8080: NOT LISTENING" -ForegroundColor Red
}

if ($port5000) {
    Write-Host "  OK Port 5000: LISTENING" -ForegroundColor Green
} else {
    Write-Host "  FAIL Port 5000: NOT LISTENING" -ForegroundColor Red
}

if ($port5173) {
    Write-Host "  OK Port 5173: LISTENING" -ForegroundColor Green
} elseif ($port5174) {
    Write-Host "  WARN Port 5174: LISTENING (instead of 5173)" -ForegroundColor Yellow
} else {
    Write-Host "  FAIL Port 5173/5174: NOT LISTENING" -ForegroundColor Red
}

Write-Host ""

# 3. Spring Boot Health Check
Write-Host "[3/6] Spring Boot Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  OK Spring Boot: HEALTHY" -ForegroundColor Green
    Write-Host "     Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL Spring Boot: NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# 4. Flask Health Check
Write-Host "[4/6] Flask Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  OK Flask: HEALTHY" -ForegroundColor Green
    Write-Host "     Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL Flask: NOT RESPONDING" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# 5. Frontend Check
Write-Host "[5/6] Frontend Check..." -ForegroundColor Yellow
$frontendPort = if ($port5173) { 5173 } elseif ($port5174) { 5174 } else { $null }
if ($frontendPort) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$frontendPort" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  OK Frontend: RUNNING (Port $frontendPort)" -ForegroundColor Green
    } catch {
        Write-Host "  FAIL Frontend: NOT RESPONDING" -ForegroundColor Red
    }
} else {
    Write-Host "  FAIL Frontend: Port not found" -ForegroundColor Red
}

Write-Host ""

# 6. API Endpoint Test
Write-Host "[6/6] API Endpoint Test..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/stocks/search?q=AAPL" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  OK Stock Search API: WORKING" -ForegroundColor Green
    if ($response.success) {
        Write-Host "     Results: $($response.count) found" -ForegroundColor Gray
    }
} catch {
    Write-Host "  FAIL Stock Search API: FAILED" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# 7. Frontend Env Check
Write-Host "[Additional] Frontend Environment Check..." -ForegroundColor Yellow
$envFile = Join-Path $PSScriptRoot "frontend\.env"
if (Test-Path $envFile) {
    Write-Host "  OK .env file exists" -ForegroundColor Green
    $envContent = Get-Content $envFile
    $envContent | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
} else {
    Write-Host "  WARN .env file not found (using default)" -ForegroundColor Yellow
    Write-Host "     Default: http://localhost:8080" -ForegroundColor Gray
}

Write-Host ""

# 8. CORS Check
Write-Host "[Additional] CORS Configuration Check..." -ForegroundColor Yellow
$webConfigPath = Join-Path $PSScriptRoot "backend\src\main\java\com\toandfrom\toandfrom\config\WebConfig.java"
if (Test-Path $webConfigPath) {
    $webConfigContent = Get-Content $webConfigPath -Raw
    if ($webConfigContent -match "localhost:5173" -or $webConfigContent -match "localhost:5174") {
        Write-Host "  OK CORS configured for ports 5173/5174" -ForegroundColor Green
    } else {
        Write-Host "  WARN CORS may need port 5174" -ForegroundColor Yellow
    }
} else {
    Write-Host "  WARN WebConfig.java not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Diagnosis
Write-Host "Diagnosis:" -ForegroundColor Yellow
if (-not $port8080) {
    Write-Host "  FAIL Spring Boot not running on port 8080" -ForegroundColor Red
    Write-Host "     Fix: Run .\start-all.ps1 again" -ForegroundColor Gray
}

if ($port5174 -and -not $port5173) {
    Write-Host "  WARN Frontend running on port 5174 (not 5173)" -ForegroundColor Yellow
    Write-Host "     Fix: Access http://localhost:5174" -ForegroundColor Gray
    Write-Host "     Fix: CORS updated to include port 5174" -ForegroundColor Gray
    Write-Host "     Fix: Restart Spring Boot after CORS change" -ForegroundColor Gray
}

Write-Host ""
