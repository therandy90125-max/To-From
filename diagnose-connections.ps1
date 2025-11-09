# diagnose-connections.ps1
# QuantaFolio Navigator - Connection Diagnostic Tool

$ErrorActionPreference = "Continue"

Write-Host "[INFO] QuantaFolio Navigator - Connection Diagnostics" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: Port Listening Check
Write-Host "`n[Test 1] Checking if services are listening on ports..." -ForegroundColor Yellow

$ports = @{
    5173 = "Frontend"
    8080 = "Backend"
    5000 = "Quantum Service"
}

$portStatus = @{}
foreach ($port in $ports.Keys) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        $processName = if ($process) { $process.Name } else { "Unknown" }
        Write-Host "  [OK] Port $port ($($ports[$port])): LISTENING" -ForegroundColor Green
        Write-Host "       Process: $processName (PID: $($connection.OwningProcess))" -ForegroundColor Gray
        $portStatus[$port] = $true
    } else {
        Write-Host "  [ERROR] Port $port ($($ports[$port])): NOT LISTENING" -ForegroundColor Red
        $portStatus[$port] = $false
    }
}

# Test 2: Backend Health Check
Write-Host "`n[Test 2] Testing Backend Health Endpoint..." -ForegroundColor Yellow

if ($portStatus[8080]) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "  [OK] Backend Health: OK (Status: $($response.StatusCode))" -ForegroundColor Green
        
        try {
            $jsonResponse = $response.Content | ConvertFrom-Json
            Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
            if ($jsonResponse.status) {
                Write-Host "  Status: $($jsonResponse.status)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [ERROR] Backend Health: FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*404*") {
            Write-Host "  → Actuator may not be enabled. Check application.properties" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  [SKIP] Backend not running on port 8080" -ForegroundColor Yellow
}

# Test 3: Stock Search API
Write-Host "`n[Test 3] Testing Stock Search API..." -ForegroundColor Yellow

if ($portStatus[8080]) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/stocks/search?query=AAPL" -UseBasicParsing -TimeoutSec 5
        Write-Host "  [OK] Stock Search API: OK (Status: $($response.StatusCode))" -ForegroundColor Green
        
        $previewLength = [Math]::Min(200, $response.Content.Length)
        if ($previewLength -gt 0) {
            Write-Host "  Response Preview: $($response.Content.Substring(0, $previewLength))..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [ERROR] Stock Search API: FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*404*") {
            Write-Host "  → Endpoint may not exist. Check StockSearchController.java" -ForegroundColor Yellow
        } elseif ($_.Exception.Message -like "*CORS*") {
            Write-Host "  → CORS issue detected. Check WebConfig.java" -ForegroundColor Yellow
        } elseif ($_.Exception.Message -like "*500*") {
            Write-Host "  → Server error. Check backend logs" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  [SKIP] Backend not running on port 8080" -ForegroundColor Yellow
}

# Test 4: Quantum Service Health
Write-Host "`n[Test 4] Testing Quantum Service..." -ForegroundColor Yellow

if ($portStatus[5000]) {
    try {
        # Try the correct health endpoint
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "  [OK] Quantum Service Health: OK (Status: $($response.StatusCode))" -ForegroundColor Green
        
        try {
            $jsonResponse = $response.Content | ConvertFrom-Json
            if ($jsonResponse.status) {
                Write-Host "  Status: $($jsonResponse.status)" -ForegroundColor Gray
            }
            if ($jsonResponse.service) {
                Write-Host "  Service: $($jsonResponse.service)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [WARNING] Quantum Service Health Endpoint: Not available" -ForegroundColor Yellow
        Write-Host "  Trying root endpoint..." -ForegroundColor Gray
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing -TimeoutSec 5
            Write-Host "  [OK] Quantum Service Root: OK (Status: $($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "  [ERROR] Quantum Service: FAILED" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  [SKIP] Quantum Service not running on port 5000" -ForegroundColor Yellow
}

# Test 5: Frontend Access
Write-Host "`n[Test 5] Testing Frontend..." -ForegroundColor Yellow

if ($portStatus[5173]) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
        Write-Host "  [OK] Frontend: OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Frontend: FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  [SKIP] Frontend not running on port 5173" -ForegroundColor Yellow
}

# Test 6: CORS Preflight Test
Write-Host "`n[Test 6] Testing CORS Configuration..." -ForegroundColor Yellow

if ($portStatus[8080]) {
    try {
        $headers = @{
            "Origin" = "http://localhost:5173"
            "Access-Control-Request-Method" = "GET"
        }
        
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/stocks/search?query=test" `
                                       -Method OPTIONS `
                                       -Headers $headers `
                                       -UseBasicParsing `
                                       -TimeoutSec 5 `
                                       -ErrorAction Stop
        
        $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
        
        if ($corsHeader -eq "http://localhost:5173" -or $corsHeader -eq "*") {
            Write-Host "  [OK] CORS: Configured correctly" -ForegroundColor Green
            Write-Host "  Allow-Origin: $corsHeader" -ForegroundColor Gray
        } else {
            Write-Host "  [WARNING] CORS: May need configuration" -ForegroundColor Yellow
            Write-Host "  Allow-Origin: $corsHeader" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [WARNING] CORS: Unable to test (this might be OK)" -ForegroundColor Yellow
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [SKIP] Backend not running on port 8080" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "[INFO] Diagnostic Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nService URLs:" -ForegroundColor White
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor Gray
Write-Host "  Backend:   http://localhost:8080" -ForegroundColor Gray
Write-Host "  Quantum:   http://localhost:5000" -ForegroundColor Gray

Write-Host "`nAPI Endpoints to Check:" -ForegroundColor White
Write-Host "  Stock Search:     http://localhost:8080/api/stocks/search?query=AAPL" -ForegroundColor Gray
Write-Host "  Optimization:     http://localhost:8080/api/optimize" -ForegroundColor Gray
Write-Host "  Health Check:     http://localhost:8080/actuator/health" -ForegroundColor Gray
Write-Host "  Flask Health:     http://localhost:5000/api/health" -ForegroundColor Gray

Write-Host "`nTroubleshooting:" -ForegroundColor White
Write-Host "  1. Check Backend logs in the Spring Boot terminal" -ForegroundColor Gray
Write-Host "  2. Open Browser DevTools (F12) → Network tab" -ForegroundColor Gray
Write-Host "  3. Try accessing http://localhost:8080/actuator/health directly" -ForegroundColor Gray
Write-Host "  4. Check CORS configuration in WebConfig.java" -ForegroundColor Gray
Write-Host "  5. Verify API endpoints in Controller classes" -ForegroundColor Gray
Write-Host "  6. Check Flask logs in python-backend terminal" -ForegroundColor Gray
Write-Host "  7. Run .\check-services.ps1 for quick status check" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host ""

