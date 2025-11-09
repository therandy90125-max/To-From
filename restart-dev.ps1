# restart-dev.ps1
# QuantaFolio Navigator - Restart All Services

$ErrorActionPreference = "Continue"

Write-Host "[INFO] Restarting QuantaFolio Navigator Services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Stop all services
Write-Host "`n[Step 1/2] Stopping all services..." -ForegroundColor Yellow
& "$PSScriptRoot\stop-dev.ps1"

Start-Sleep -Seconds 3

# Step 2: Start all services
Write-Host "`n[Step 2/2] Starting all services..." -ForegroundColor Yellow
& "$PSScriptRoot\start-dev.ps1"

Write-Host "`n[SUCCESS] Restart complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

