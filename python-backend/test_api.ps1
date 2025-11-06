# ToAndFrom Portfolio Optimizer - API 테스트 스크립트

Write-Host "포트폴리오 최적화 API 테스트" -ForegroundColor Cyan
Write-Host "=" * 50

# 테스트 데이터
$body = @{
    tickers = @("AAPL", "GOOGL", "MSFT")
    risk_factor = 0.5
    method = "classical"
    period = "1y"
} | ConvertTo-Json

Write-Host "`n요청 데이터:" -ForegroundColor Yellow
Write-Host $body
Write-Host "`n최적화 실행 중..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/optimize" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "`n성공!" -ForegroundColor Green
    Write-Host "=" * 50
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`n오류 발생:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

