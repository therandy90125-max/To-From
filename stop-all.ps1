# QuantaFolio Navigator - Stop All Services
$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "  QuantaFolio Navigator - Stop All" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

$ports = @(5000, 8080, 5173)
$stoppedCount = 0

foreach ($port in $ports) {
    Write-Host "Port $port checking..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                
                if ($process) {
                    Write-Host "  Stopping: $($process.Name) (PID: $($process.Id))" -ForegroundColor Gray
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    $stoppedCount++
                    Start-Sleep -Milliseconds 500
                }
            }
            Write-Host "  [OK] Port $port cleaned" -ForegroundColor Green
        } else {
            Write-Host "  [INFO] Port $port - No running process" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [WARN] Port $port error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Red
if ($stoppedCount -gt 0) {
    Write-Host "[SUCCESS] $stoppedCount processes stopped" -ForegroundColor Green
} else {
    Write-Host "[INFO] No processes to stop" -ForegroundColor Gray
}
Write-Host "========================================`n" -ForegroundColor Red

# Final check
Write-Host "Final status check:" -ForegroundColor Cyan
$stillRunning = $false

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  [WARN] Port $port still running" -ForegroundColor Yellow
        $stillRunning = $true
    } else {
        Write-Host "  [OK] Port $port cleaned" -ForegroundColor Green
    }
}

if ($stillRunning) {
    Write-Host "`n[WARN] Some processes are still running." -ForegroundColor Yellow
    Write-Host "Run this script again or stop manually." -ForegroundColor Yellow
} else {
    Write-Host "`n[SUCCESS] All services stopped successfully!" -ForegroundColor Green
}

Write-Host ""
pause
