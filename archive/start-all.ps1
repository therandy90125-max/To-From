Write-Host "🚀 QuantaFolio Navigator 시작 중..." -ForegroundColor Cyan
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

# 포트 충돌 확인 및 정리
Write-Host "🔍 포트 충돌 확인 중..." -ForegroundColor Yellow

# 포트 8080 확인
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    $pid = $port8080.OwningProcess
    Write-Host "  ⚠️  포트 8080 사용 중 (PID: $pid), 종료 중..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 포트 5000 확인
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid = $port5000.OwningProcess
    Write-Host "  ⚠️  포트 5000 사용 중 (PID: $pid), 종료 중..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 포트 5173 확인
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    $pid = $port5173.OwningProcess
    Write-Host "  ⚠️  포트 5173 사용 중 (PID: $pid), 종료 중..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "  ✅ 포트 정리 완료" -ForegroundColor Green
Write-Host ""

# 1. Flask Backend 시작
Write-Host "`n📦 Flask Backend 시작 (Port 5000)..." -ForegroundColor Yellow
$flaskPath = Join-Path $scriptPath "python-backend"
Write-Host "Flask 경로: $flaskPath" -ForegroundColor Gray

if (Test-Path $flaskPath) {
    $venvPath = Join-Path $flaskPath "venv"
    $venvActivate = Join-Path $venvPath "Scripts\Activate.ps1"
    
    # 가상환경 확인 및 생성
    if (-not (Test-Path $venvPath)) {
        Write-Host "   가상환경 생성 중..." -ForegroundColor Gray
        Set-Location $flaskPath
        python -m venv venv
        Set-Location $scriptPath
    }
    
    # Flask 시작 (가상환경 활성화)
    if (Test-Path $venvActivate) {
        $flaskCommand = "Set-Location '$flaskPath'; .\venv\Scripts\Activate.ps1; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   Flask Backend (Port 5000)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; python app.py"
    } else {
        $flaskCommand = "Set-Location '$flaskPath'; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   Flask Backend (Port 5000)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; python app.py"
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $flaskCommand
    Write-Host "✅ Flask 서버 시작됨 (새 창)" -ForegroundColor Green
    Start-Sleep -Seconds 5
} else {
    Write-Host "❌ python-backend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
}

# 2. Spring Boot Backend 시작
Write-Host "`n☕ Spring Boot Backend 시작 (Port 8080)..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptPath "backend"
Write-Host "Backend 경로: $backendPath" -ForegroundColor Gray

if (Test-Path $backendPath) {
    # Maven Wrapper 확인
    $mvnw = Join-Path $backendPath "mvnw.cmd"
    if (-not (Test-Path $mvnw)) {
        $mvnw = Join-Path $backendPath "mvnw"
    }
    
    if (Test-Path $mvnw) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   Spring Boot Backend (Port 8080)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; if (Test-Path '.\mvnw.cmd') { .\mvnw.cmd spring-boot:run } else { .\mvnw spring-boot:run }"
        Write-Host "✅ Spring Boot 서버 시작됨 (새 창)" -ForegroundColor Green
        Write-Host "   백엔드 시작 대기 중 (15초)..." -ForegroundColor Gray
        Start-Sleep -Seconds 15
    } else {
        Write-Host "❌ Maven Wrapper를 찾을 수 없습니다!" -ForegroundColor Red
        Write-Host "   Maven이 설치되어 있다면 'mvn spring-boot:run'을 사용하세요." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ backend 폴더를 찾을 수 없습니다!" -ForegroundColor Red
}

# 3. React Frontend 시작
Write-Host "`n⚛️  React Frontend 시작 (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptPath "frontend"
Write-Host "Frontend 경로: $frontendPath" -ForegroundColor Gray

if (Test-Path $frontendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   React Frontend (Port 5173)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; npm run dev"
    Write-Host "✅ React 서버 시작됨 (새 창)" -ForegroundColor Green
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

