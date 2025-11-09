# check-ports.ps1
# 포트 사용 확인 스크립트

Write-Host "`n[INFO] Checking Port Usage..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ports = @(5000, 8080, 5173)
$services = @{
    5000 = "Flask Quantum Service"
    8080 = "Spring Boot Backend"
    5173 = "React Frontend"
}

# 방법 1: Get-NetTCPConnection 사용 (PowerShell 네이티브)
Write-Host "`n[Method 1] Using Get-NetTCPConnection:" -ForegroundColor Yellow
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            $processName = if ($process) { $process.Name } else { "Unknown" }
            $state = $conn.State
            Write-Host "  [OK] Port $port ($($services[$port])): IN USE" -ForegroundColor Green
            Write-Host "     Process: $processName (PID: $($conn.OwningProcess))" -ForegroundColor Gray
            Write-Host "     State: $state" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [X] Port $port ($($services[$port])): NOT IN USE" -ForegroundColor Red
    }
}

# 방법 2: netstat 사용 (대체 방법)
Write-Host "`n[Method 2] Using netstat:" -ForegroundColor Yellow
$portString = $ports -join " "
$netstatOutput = netstat -ano | findstr $portString
if ($netstatOutput) {
    Write-Host $netstatOutput
} else {
    Write-Host "  No processes found on ports $portString" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allRunning = $true
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    $running = $null -ne $connections
    if ($running) {
        Write-Host "[OK] $($services[$port]) (Port $port): RUNNING" -ForegroundColor Green
    } else {
        Write-Host "[X] $($services[$port]) (Port $port): NOT RUNNING" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan

if ($allRunning) {
    Write-Host "[SUCCESS] All services are running!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Some services are not running." -ForegroundColor Yellow
}

Write-Host ""

