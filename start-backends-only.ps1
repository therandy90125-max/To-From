# Start Backends Only (Flask + Spring Boot)
# 백엔드만 시작 (Flask + Spring Boot)

Write-Host "🚀 Backend Services 시작 중..." -ForegroundColor Cyan
Write-Host ""

# 현재 스크립트의 디렉토리 가져오기
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptPath) {
    $scriptPath = $PSScriptRoot
}
if (-not $scriptPath) {
    $scriptPath = Get-Location
}

Write-Host "프로젝트 경로: $scriptPath" -ForegroundColor Gray
Write-Host ""

# 1. Flask Backend 시작
Write-Host "📦 Flask Backend 시작 (Port 5000)..." -ForegroundColor Yellow
$flaskPath = Join-Path $scriptPath "python-backend"

if (Test-Path $flaskPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$flaskPath'; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   Flask Backend (Port 5000)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; python app.py"
    Write-Host "✅ Flask 서버 시작됨 (새 창)" -ForegroundColor Green
    Start-Sleep -Seconds 3
} else {
    Write-Host "❌ python-backend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
}

# 2. Spring Boot Backend 시작
Write-Host "`n☕ Spring Boot Backend 시작 (Port 8080)..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptPath "backend"

if (Test-Path $backendPath) {
    # Maven Wrapper 확인
    $mvnw = Join-Path $backendPath "mvnw.cmd"
    if (-not (Test-Path $mvnw)) {
        $mvnw = Join-Path $backendPath "mvnw"
    }
    
    if (Test-Path $mvnw) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   Spring Boot Backend (Port 8080)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; if (Test-Path '.\mvnw.cmd') { .\mvnw.cmd spring-boot:run } else { .\mvnw spring-boot:run }"
        Write-Host "✅ Spring Boot 서버 시작됨 (새 창)" -ForegroundColor Green
        Write-Host "   ⏳ Spring Boot는 10-30초 정도 소요됩니다..." -ForegroundColor Yellow
        Start-Sleep -Seconds 8
    } else {
        Write-Host "❌ Maven Wrapper를 찾을 수 없습니다!" -ForegroundColor Red
        Write-Host "   Maven이 설치되어 있다면 'mvn spring-boot:run'을 사용하세요." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ backend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
}

Write-Host "`n✅ 백엔드 서비스 시작 완료!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Flask:        http://localhost:5000" -ForegroundColor Yellow
Write-Host "Spring Boot:  http://localhost:8080" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n각 창에서 Ctrl+C를 누르면 종료됩니다." -ForegroundColor Gray
Write-Host ""

