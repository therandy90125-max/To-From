# Run Frontend from project root
# 프로젝트 루트에서 프론트엔드 실행

Write-Host "Starting React Frontend..." -ForegroundColor Cyan
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ frontend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules가 없습니다. npm install 실행 중..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Frontend 시작 중..." -ForegroundColor Green
Write-Host "   URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""

npm run dev

