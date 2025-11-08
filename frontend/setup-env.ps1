# Frontend 환경 변수 설정 스크립트
# Frontend Environment Variables Setup Script

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Frontend .env 파일 설정" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

# .env 파일 생성 또는 업데이트
$envContent = @"
VITE_API_URL=http://localhost:8080
VITE_PYTHON_BACKEND_URL=http://localhost:5000
"@

try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
    Write-Host "✅ .env 파일이 생성/업데이트되었습니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📄 .env 파일 내용:" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Get-Content $envPath
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Frontend를 재시작해야 환경 변수가 적용됩니다!" -ForegroundColor Yellow
    Write-Host "   Ctrl+C로 현재 서버를 중지한 후 'npm run dev'를 다시 실행하세요." -ForegroundColor Gray
} catch {
    Write-Host "❌ .env 파일 생성 실패: $($_.Exception.Message)" -ForegroundColor Red
}

