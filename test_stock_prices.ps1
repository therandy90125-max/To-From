# PowerShell Test Script for Stock Price Integration
# Windows용 테스트 스크립트

Write-Host "=== Testing Stock Price Integration ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: US Stock (Apple)
Write-Host "Test 1: US Stock - AAPL" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/stock/price/AAPL" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Korean Stock (Samsung)
Write-Host "Test 2: Korean Stock - 005930.KS" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/stock/price/005930.KS" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Batch request
Write-Host "Test 3: Batch prices" -ForegroundColor Yellow
try {
    $body = @{
        symbols = @("AAPL", "GOOGL", "005930.KS", "000660.KS")
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/stock/prices" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Spring Boot search endpoint
Write-Host "Test 4: Spring Boot search endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/stocks/search?q=apple" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Spring Boot stock info
Write-Host "Test 5: Spring Boot stock info endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/stocks/info/AAPL" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Tests Complete ===" -ForegroundColor Green

