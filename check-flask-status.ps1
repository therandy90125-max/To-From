Write-Host "Flask Server Status Check" -ForegroundColor Cyan
Write-Host ""

# Check port 5000
Write-Host "[1/3] Checking port 5000..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid = $port5000.OwningProcess
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    Write-Host "  OK: Port 5000 is in use" -ForegroundColor Green
    Write-Host "     PID: $pid" -ForegroundColor Gray
    if ($process) {
        Write-Host "     Process: $($process.ProcessName)" -ForegroundColor Gray
        Write-Host "     Path: $($process.Path)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ERROR: Port 5000 is not in use (Flask server is not running)" -ForegroundColor Red
}
Write-Host ""

# Flask Health Check
Write-Host "[2/3] Flask Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop -TimeoutSec 3
    Write-Host "  OK: Flask server responded successfully" -ForegroundColor Green
    Write-Host "     Status: $($response.status)" -ForegroundColor Gray
    if ($response.service) {
        Write-Host "     Service: $($response.service)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ERROR: Flask server did not respond" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Flask Optimize Endpoint Check
Write-Host "[3/3] Flask Optimize Endpoint Check..." -ForegroundColor Yellow
try {
    $testData = @{
        tickers = @("AAPL", "GOOGL")
        initial_weights = @(0.5, 0.5)
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/optimize/with-weights" -Method POST -Body $testData -ContentType "application/json" -ErrorAction Stop -TimeoutSec 5
    Write-Host "  OK: Optimize Endpoint responded successfully" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  WARNING: Optimize Endpoint is working but request data is invalid (normal)" -ForegroundColor Yellow
    } else {
        Write-Host "  ERROR: Optimize Endpoint did not respond" -ForegroundColor Red
        Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Flask Server URL: http://localhost:5000" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""

if (-not $port5000) {
    Write-Host "To start Flask server:" -ForegroundColor Yellow
    Write-Host "   .\start-flask-only.ps1" -ForegroundColor Green
    Write-Host "   or" -ForegroundColor Gray
    Write-Host "   .\start-all.ps1" -ForegroundColor Green
    Write-Host ""
}
