Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  포트 충돌 해결" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 포트 8080 (Spring Boot) 확인 및 정리
Write-Host "[1/3] 포트 8080 (Spring Boot) 확인 중..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    $pid = $port8080.OwningProcess
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  ⚠️  포트 8080 사용 중: PID $pid ($($process.ProcessName))" -ForegroundColor Yellow
        Write-Host "  🔧 프로세스 종료 중..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "  ✅ 프로세스 종료됨" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ 포트 8080 사용 가능" -ForegroundColor Green
}

# 포트 5000 (Flask) 확인 및 정리
Write-Host ""
Write-Host "[2/3] 포트 5000 (Flask) 확인 중..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid = $port5000.OwningProcess
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  ⚠️  포트 5000 사용 중: PID $pid ($($process.ProcessName))" -ForegroundColor Yellow
        Write-Host "  🔧 프로세스 종료 중..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "  ✅ 프로세스 종료됨" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ 포트 5000 사용 가능" -ForegroundColor Green
}

# 포트 5173/5174 (Frontend) 확인 및 정리
Write-Host ""
Write-Host "[3/3] 포트 5173/5174 (Frontend) 확인 중..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
$port5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue

if ($port5173) {
    $pid = $port5173.OwningProcess
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  ⚠️  포트 5173 사용 중: PID $pid ($($process.ProcessName))" -ForegroundColor Yellow
        Write-Host "  🔧 프로세스 종료 중..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "  ✅ 프로세스 종료됨" -ForegroundColor Green
    }
}

if ($port5174) {
    $pid = $port5174.OwningProcess
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  ⚠️  포트 5174 사용 중: PID $pid ($($process.ProcessName))" -ForegroundColor Yellow
        Write-Host "  🔧 프로세스 종료 중..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "  ✅ 프로세스 종료됨" -ForegroundColor Green
    }
}

if (-not $port5173 -and -not $port5174) {
    Write-Host "  ✅ 포트 5173/5174 사용 가능" -ForegroundColor Green
}

# 모든 Java, Python, Node 프로세스 종료 (추가 정리)
Write-Host ""
Write-Host "추가 정리: Java, Python, Node 프로세스 확인 중..." -ForegroundColor Yellow
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($javaProcesses) {
    Write-Host "  🔧 Java 프로세스 종료 중 ($($javaProcesses.Count)개)..." -ForegroundColor Gray
    Stop-Process -Name java -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

if ($pythonProcesses) {
    Write-Host "  🔧 Python 프로세스 종료 중 ($($pythonProcesses.Count)개)..." -ForegroundColor Gray
    Stop-Process -Name python -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

if ($nodeProcesses) {
    Write-Host "  🔧 Node 프로세스 종료 중 ($($nodeProcesses.Count)개)..." -ForegroundColor Gray
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ✅ 포트 정리 완료!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "이제 다음 명령어로 서비스를 시작하세요:" -ForegroundColor Yellow
Write-Host "  .\start-all.ps1" -ForegroundColor White
Write-Host "  또는" -ForegroundColor Gray
Write-Host "  .\run_all.ps1" -ForegroundColor White
Write-Host ""

