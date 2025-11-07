# PowerShell Test Script for ToAndFrom API
# Run this after all services are started

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ToAndFrom API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$SuccessCount = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "  URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ PASSED" -ForegroundColor Green
        Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        $script:SuccessCount++
        return $true
    }
    catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
    Write-Host ""
}

# Test 1: Flask Health
Write-Host "`n[TEST 1] Flask Backend" -ForegroundColor Magenta
Test-Endpoint -Name "Flask Health Check" -Url "http://localhost:5000/api/health"

# Test 2: Flask Optimization
Write-Host "`n[TEST 2] Flask Optimization (Direct)" -ForegroundColor Magenta
$flaskBody = @{
    tickers = @("AAPL", "GOOGL")
    risk_factor = 0.5
    method = "classical"
    period = "1mo"
} | ConvertTo-Json

Test-Endpoint -Name "Flask Optimize" -Url "http://localhost:5000/api/optimize" -Method "POST" -Body $flaskBody

# Test 3: Spring Boot Health
Write-Host "`n[TEST 3] Spring Boot Backend" -ForegroundColor Magenta
Test-Endpoint -Name "Spring Boot → Flask Health" -Url "http://localhost:8080/api/portfolio/health/flask"

# Test 4: Spring Boot Optimization
Write-Host "`n[TEST 4] Spring Boot Optimization (via Proxy)" -ForegroundColor Magenta
$springBody = @{
    tickers = @("AAPL", "MSFT")
    risk_factor = 0.5
    method = "classical"
    period = "1mo"
} | ConvertTo-Json

Test-Endpoint -Name "Spring Boot Optimize" -Url "http://localhost:8080/api/portfolio/optimize" -Method "POST" -Body $springBody

# Test 5: Spring Boot Optimization with Auto-Save
Write-Host "`n[TEST 5] Spring Boot Auto-Save" -ForegroundColor Magenta
$autoSaveBody = @{
    tickers = @("AAPL", "GOOGL", "MSFT")
    risk_factor = 0.5
    method = "classical"
    period = "1mo"
    auto_save = $true
} | ConvertTo-Json

Test-Endpoint -Name "Spring Boot Auto-Save" -Url "http://localhost:8080/api/portfolio/optimize" -Method "POST" -Body $autoSaveBody

# Test 6: Chatbot
Write-Host "`n[TEST 6] Chatbot Endpoint" -ForegroundColor Magenta
$chatBody = @{
    message = "What is Sharpe Ratio?"
    language = "en"
} | ConvertTo-Json

Test-Endpoint -Name "Chatbot Chat" -Url "http://localhost:8080/api/chatbot/chat" -Method "POST" -Body $chatBody

# Test 7: Frontend (just check if it's running)
Write-Host "`n[TEST 7] Frontend Server" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✅ Frontend is running on port 5173" -ForegroundColor Green
    $script:SuccessCount++
}
catch {
    Write-Host "  ❌ Frontend not accessible" -ForegroundColor Red
    $script:ErrorCount++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $SuccessCount" -ForegroundColor Green
Write-Host "Failed: $ErrorCount" -ForegroundColor Red

if ($ErrorCount -eq 0) {
    Write-Host "`n🎉 All tests passed! System is ready." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "2. Test the UI manually (see TEST_GUIDE.md)" -ForegroundColor White
Write-Host "3. Check database: mysql -u root -p toandfrom" -ForegroundColor White

