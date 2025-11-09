# PowerShell에서 Flask API 테스트 스크립트
# 사용법: .\test-api.ps1

Write-Host "=== Flask API Test Script ===" -ForegroundColor Cyan
Write-Host ""

# 방법 1: Hashtable을 JSON으로 변환 (권장)
$body = @{
    tickers = @("005930.KS", "000270.KS", "005380.KS")
    initial_weights = @(0.33, 0.33, 0.34)
    method = "quantum"
    risk_factor = 0.5
    fast_mode = $true
} | ConvertTo-Json -Depth 10

Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor Gray
Write-Host ""

# API 호출
try {
    Write-Host "Sending POST request to /api/portfolio/optimize..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod `
        -Uri "http://127.0.0.1:5000/api/portfolio/optimize" `
        -Method POST `
        -Body $body `
        -ContentType "application/json; charset=utf-8" `
        -ErrorAction Stop
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    if ($_.Response) {
        Write-Host ""
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Alternative: Simple optimize (without initial_weights) ===" -ForegroundColor Cyan

$bodySimple = @{
    tickers = @("005930.KS", "000270.KS", "005380.KS")
    method = "classical"
    risk_factor = 0.5
} | ConvertTo-Json -Depth 10

try {
    $responseSimple = Invoke-RestMethod `
        -Uri "http://127.0.0.1:5000/api/portfolio/optimize" `
        -Method POST `
        -Body $bodySimple `
        -ContentType "application/json; charset=utf-8" `
        -ErrorAction Stop
    
    Write-Host "SUCCESS (Simple Request)!" -ForegroundColor Green
    $responseSimple | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

