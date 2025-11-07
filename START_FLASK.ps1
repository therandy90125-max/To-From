# Flask Backend Startup Script
# ToAndFrom Portfolio Optimization

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Flask Backend Starting..." -ForegroundColor Yellow
Write-Host "   Port: 5000" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to python-backend directory
Set-Location -Path $PSScriptRoot\python-backend

# Check if Python is available
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "✓ Python found" -ForegroundColor Green
    python --version
} else {
    Write-Host "✗ Python not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Flask server..." -ForegroundColor Yellow
Write-Host ""

# Start Flask
python app.py

