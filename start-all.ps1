Write-Host "🚀 QuantaFolio Navigator 시작 중..." -ForegroundColor Cyan

# 현재 스크립트의 디렉토리 가져오기
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "프로젝트 경로: $scriptPath" -ForegroundColor Gray

# 1. Flask Backend 시작
Write-Host "`n📦 Flask Backend 시작 (Port 5000)..." -ForegroundColor Yellow
$flaskPath = Join-Path $scriptPath "python-backend"
Write-Host "Flask 경로: $flaskPath" -ForegroundColor Gray

if (Test-Path $flaskPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$flaskPath'; python app.py"
    Start-Sleep -Seconds 3
} else {
    Write-Host "❌ python-backend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
}

# 2. Spring Boot Backend 시작
Write-Host "`n☕ Spring Boot Backend 시작 (Port 8080)..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptPath "backend"
Write-Host "Backend 경로: $backendPath" -ForegroundColor Gray

if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; .\mvnw spring-boot:run"
    Start-Sleep -Seconds 8
} else {
    Write-Host "❌ backend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
}

# 3. React Frontend 시작
Write-Host "`n⚛️  React Frontend 시작 (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptPath "frontend"
Write-Host "Frontend 경로: $frontendPath" -ForegroundColor Gray

if (Test-Path $frontendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"
    Start-Sleep -Seconds 10
} else {
    Write-Host "❌ frontend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
}

# 브라우저 자동 열기
Write-Host "`n🌐 브라우저 열기..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n✅ 모든 서비스가 시작되었습니다!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Flask:        http://localhost:5000" -ForegroundColor Yellow
Write-Host "Spring Boot:  http://localhost:8080" -ForegroundColor Yellow
Write-Host "Frontend:     http://localhost:5173" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n종료하려면 각 창에서 Ctrl+C를 누르세요." -ForegroundColor Gray

pause

