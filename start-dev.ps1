# QuantaFolio Navigator - Development Start Script
# 모든 서비스를 동시에 실행하고 모니터링합니다

param(
    [switch]$StopFirst = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

# 색상 정의
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "`n========================================" "Cyan"
Write-ColorOutput "  QuantaFolio Navigator - Dev Start" "Cyan"
Write-ColorOutput "========================================`n" "Cyan"

# 현재 디렉토리 확인
$projectRoot = $PSScriptRoot
Write-ColorOutput "프로젝트 경로: $projectRoot" "Gray"

# 기존 프로세스 종료 (옵션)
if ($StopFirst) {
    Write-ColorOutput "`n[1/4] 기존 프로세스 종료 중..." "Yellow"
    $ports = @(5000, 8080, 5173)
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-ColorOutput "  종료: $($process.Name) (PID: $($process.Id)) on Port $port" "Gray"
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
    Start-Sleep -Seconds 2
}

# 포트 확인 함수
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# 1. Flask Backend 시작
Write-ColorOutput "`n[2/4] Flask Backend 시작 중 (Port 5000)..." "Yellow"
$flaskPath = Join-Path $projectRoot "python-backend"

if (-not (Test-Path $flaskPath)) {
    Write-ColorOutput "❌ python-backend 폴더를 찾을 수 없습니다!" "Red"
    exit 1
}

# Flask 실행
$flaskCmd = @"
Set-Location '$flaskPath'
Write-Host '================================================' -ForegroundColor Cyan
Write-Host '   Flask Backend (Port 5000)' -ForegroundColor Cyan
Write-Host '================================================' -ForegroundColor Cyan
Write-Host ''
python app.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $flaskCmd
Write-ColorOutput "✅ Flask 서버 시작됨 (새 창)" "Green"
Start-Sleep -Seconds 5

# Flask 포트 확인
if (Test-Port 5000) {
    Write-ColorOutput "✅ Flask 서버 실행 확인: Port 5000" "Green"
} else {
    Write-ColorOutput "⚠️  Flask 서버가 아직 시작되지 않았습니다. 잠시 더 대기 중..." "Yellow"
    Start-Sleep -Seconds 5
}

# 2. Spring Boot Backend 시작
Write-ColorOutput "`n[3/4] Spring Boot Backend 시작 중 (Port 8080)..." "Yellow"
$backendPath = Join-Path $projectRoot "backend"

if (-not (Test-Path $backendPath)) {
    Write-ColorOutput "❌ backend 폴더를 찾을 수 없습니다!" "Red"
    exit 1
}

# Maven Wrapper 확인
$mvnw = Join-Path $backendPath "mvnw.cmd"
if (-not (Test-Path $mvnw)) {
    $mvnw = Join-Path $backendPath "mvnw"
}

if (-not (Test-Path $mvnw)) {
    Write-ColorOutput "❌ Maven Wrapper를 찾을 수 없습니다!" "Red"
    exit 1
}

# Spring Boot 실행
$springCmd = @"
Set-Location '$backendPath'
Write-Host '================================================' -ForegroundColor Cyan
Write-Host '   Spring Boot Backend (Port 8080)' -ForegroundColor Cyan
Write-Host '================================================' -ForegroundColor Cyan
Write-Host ''
.\mvnw.cmd spring-boot:run
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $springCmd
Write-ColorOutput "✅ Spring Boot 서버 시작됨 (새 창)" "Green"
Start-Sleep -Seconds 10

# Spring Boot 포트 확인
$retries = 0
$maxRetries = 30
while (-not (Test-Port 8080) -and $retries -lt $maxRetries) {
    Write-ColorOutput "⏳ Spring Boot 시작 대기 중... ($retries/$maxRetries)" "Yellow"
    Start-Sleep -Seconds 2
    $retries++
}

if (Test-Port 8080) {
    Write-ColorOutput "✅ Spring Boot 서버 실행 확인: Port 8080" "Green"
} else {
    Write-ColorOutput "⚠️  Spring Boot 서버가 시작되지 않았습니다. 수동 확인이 필요합니다." "Yellow"
}

# 3. React Frontend 시작
Write-ColorOutput "`n[4/4] React Frontend 시작 중 (Port 5173)..." "Yellow"
$frontendPath = Join-Path $projectRoot "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-ColorOutput "❌ frontend 폴더를 찾을 수 없습니다!" "Red"
    exit 1
}

# Node modules 확인
$nodeModules = Join-Path $frontendPath "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-ColorOutput "⚠️  node_modules가 없습니다. npm install 실행 중..." "Yellow"
    Set-Location $frontendPath
    npm install
    Set-Location $projectRoot
}

# React 실행
$reactCmd = @"
Set-Location '$frontendPath'
Write-Host '================================================' -ForegroundColor Cyan
Write-Host '   React Frontend (Port 5173)' -ForegroundColor Cyan
Write-Host '================================================' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $reactCmd
Write-ColorOutput "✅ React 서버 시작됨 (새 창)" "Green"
Start-Sleep -Seconds 8

# React 포트 확인
if (Test-Port 5173) {
    Write-ColorOutput "✅ React 서버 실행 확인: Port 5173" "Green"
} else {
    Write-ColorOutput "⚠️  React 서버가 아직 시작되지 않았습니다. 잠시 더 대기 중..." "Yellow"
    Start-Sleep -Seconds 5
}

# 최종 상태 확인
Write-ColorOutput "`n========================================" "Cyan"
Write-ColorOutput "  서버 상태 확인" "Cyan"
Write-ColorOutput "========================================" "Cyan"

$services = @(
    @{Name="Flask Backend"; Port=5000; URL="http://localhost:5000"},
    @{Name="Spring Boot"; Port=8080; URL="http://localhost:8080"},
    @{Name="React Frontend"; Port=5173; URL="http://localhost:5173"}
)

$allRunning = $true
foreach ($service in $services) {
    $running = Test-Port $service.Port
    if ($running) {
        Write-ColorOutput "✅ $($service.Name): RUNNING ($($service.URL))" "Green"
    } else {
        Write-ColorOutput "❌ $($service.Name): NOT RUNNING" "Red"
        $allRunning = $false
    }
}

Write-ColorOutput "`n========================================" "Cyan"

if ($allRunning) {
    Write-ColorOutput "✅ 모든 서비스가 성공적으로 시작되었습니다!" "Green"
    Write-ColorOutput "`n🌐 브라우저를 열고 있습니다..." "Cyan"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5173"
    
    Write-ColorOutput "`n📝 개발 환경 준비 완료!" "Green"
    Write-ColorOutput "   Frontend: http://localhost:5173" "White"
    Write-ColorOutput "   Backend:  http://localhost:8080" "White"
    Write-ColorOutput "   Flask:    http://localhost:5000" "White"
} else {
    Write-ColorOutput "⚠️  일부 서비스가 시작되지 않았습니다." "Yellow"
    Write-ColorOutput "   각 창에서 에러 메시지를 확인해주세요." "Yellow"
}

Write-ColorOutput "`n종료하려면 stop-all.ps1을 실행하거나" "Gray"
Write-ColorOutput "각 PowerShell 창에서 Ctrl+C를 누르세요." "Gray"

Write-ColorOutput "`n========================================`n" "Cyan"

# 로그 파일 위치 표시
if ($Verbose) {
    Write-ColorOutput "상세 로그:" "Gray"
    Write-ColorOutput "  Flask:      $flaskPath" "Gray"
    Write-ColorOutput "  Spring Boot: $backendPath" "Gray"
    Write-ColorOutput "  React:      $frontendPath" "Gray"
}

pause

