# check-services.ps1
# QuantaFolio Navigator - Service Health Check

$ErrorActionPreference = "Continue"

Write-Host "[INFO] Checking QuantaFolio Navigator Services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$services = @(
    @{Name="Frontend (React)"; Port=5173; Url="http://localhost:5173"; HealthCheck=$false},
    @{Name="Backend (Spring Boot)"; Port=8080; Url="http://localhost:8080/actuator/health"; HealthCheck=$true},
    @{Name="Quantum Service (Flask)"; Port=5000; Url="http://localhost:5000/api/health"; HealthCheck=$true}
)

$allHealthy = $true
$runningCount = 0

foreach ($service in $services) {
    Write-Host "`n[$($service.Name)]" -ForegroundColor Yellow
    
    # Check port
    $connection = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue
    
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        $processName = if ($process) { $process.Name } else { "Unknown" }
        
        Write-Host "  Port $($service.Port): " -NoNewline
        Write-Host "[OK] LISTENING" -ForegroundColor Green
        Write-Host "  Process: $processName (PID: $($connection.OwningProcess))" -ForegroundColor Gray
        
        # Try HTTP health check (if enabled)
        if ($service.HealthCheck) {
            try {
                $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                Write-Host "  HTTP Health: " -NoNewline
                Write-Host "[OK] OK (Status: $($response.StatusCode))" -ForegroundColor Green
                
                # Try to parse JSON response for Flask/Spring Boot
                try {
                    $jsonResponse = $response.Content | ConvertFrom-Json
                    if ($jsonResponse.status) {
                        Write-Host "  Status: $($jsonResponse.status)" -ForegroundColor Gray
                    }
                } catch {
                    # Not JSON or parsing failed, ignore
                }
            } catch {
                Write-Host "  HTTP Health: " -NoNewline
                Write-Host "[WARNING] No response (service may still be starting)" -ForegroundColor Yellow
                Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
            }
        }
        $runningCount++
    } else {
        Write-Host "  Port $($service.Port): " -NoNewline
        Write-Host "[ERROR] NOT RUNNING" -ForegroundColor Red
        Write-Host "  URL: $($service.Url)" -ForegroundColor Gray
        $allHealthy = $false
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan

if ($allHealthy -and $runningCount -eq $services.Count) {
    Write-Host "[SUCCESS] All services are running!" -ForegroundColor Green
    Write-Host "`nService URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
    Write-Host "  Backend:   http://localhost:8080" -ForegroundColor White
    Write-Host "  Quantum:   http://localhost:5000" -ForegroundColor White
    Write-Host "`nAdditional URLs:" -ForegroundColor Cyan
    Write-Host "  API Docs:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
    Write-Host "  H2 DB:     http://localhost:8080/h2-console" -ForegroundColor White
    Write-Host "  Flask API: http://localhost:5000" -ForegroundColor White
} else {
    Write-Host "[WARNING] Some services are not running!" -ForegroundColor Yellow
    Write-Host "  Running: $runningCount / $($services.Count)" -ForegroundColor Yellow
    Write-Host "  Run .\start-dev.ps1 to start all services" -ForegroundColor White
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

