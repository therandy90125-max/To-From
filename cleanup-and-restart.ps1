# cleanup-and-restart.ps1
# QuantaFolio Navigator - Force Cleanup and Restart

Write-Host "[INFO] Cleaning up all services..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$ports = @(5173, 8080, 5000)
$processIds = @()

# Collect all process IDs
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            $processIds += $pids
            Write-Host "Found processes on port $port : $pids" -ForegroundColor Gray
        }
    } catch {
        # Port not in use
    }
}

# Stop all processes
if ($processIds.Count -gt 0) {
    Write-Host "`nStopping $($processIds.Count) process(es)..." -ForegroundColor Yellow
    
    foreach ($pid in $processIds) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "[OK] Stopped PID: $pid ($($process.ProcessName))" -ForegroundColor Green
            }
        } catch {
            Write-Host "[X] Failed to stop PID: $pid" -ForegroundColor Red
        }
    }
} else {
    Write-Host "`n[OK] No processes to stop." -ForegroundColor Green
}

# Wait for ports to be released
Write-Host "`n[INFO] Waiting for ports to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verify ports are free
Write-Host "`n[INFO] Verifying ports..." -ForegroundColor Yellow
$allClear = $true

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "[WARNING] Port $port still in use!" -ForegroundColor Red
        $allClear = $false
    } else {
        Write-Host "[OK] Port $port is free" -ForegroundColor Green
    }
}

if (-not $allClear) {
    Write-Host "`n[WARNING] Some ports are still in use. Please restart manually." -ForegroundColor Yellow
    Write-Host "Or run this script again in a few seconds." -ForegroundColor Yellow
    exit 1
}

# Start all services
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "[INFO] Starting all services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

& .\start-dev.ps1

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "[SUCCESS] Cleanup and restart complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

