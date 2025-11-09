# stop-dev.ps1
# QuantaFolio Navigator - Stop All Services

$ErrorActionPreference = "Continue"

Write-Host "[INFO] Stopping QuantaFolio Navigator Services..." -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red

$ports = @(5173, 8080, 5000)
$serviceNames = @{
    5173 = "Frontend (React)"
    8080 = "Backend (Spring Boot)"
    5000 = "Quantum Service (Flask)"
}

$stoppedCount = 0

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connections) {
            $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            
            foreach ($pid in $processIds) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        $processName = $process.Name
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "[OK] Stopped $($serviceNames[$port]) (PID: $pid, Process: $processName, Port: $port)" -ForegroundColor Green
                        $stoppedCount++
                    }
                } catch {
                    Write-Host "[WARNING] Failed to stop process $pid on port $port" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "[INFO] No service running on port $port ($($serviceNames[$port]))" -ForegroundColor Gray
        }
    } catch {
        Write-Host "[ERROR] Error checking port $port" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Red

if ($stoppedCount -gt 0) {
    Write-Host "[SUCCESS] Stopped $stoppedCount service(s)" -ForegroundColor Green
} else {
    Write-Host "[INFO] No services were running" -ForegroundColor Cyan
}

Write-Host "========================================" -ForegroundColor Red
Write-Host ""

