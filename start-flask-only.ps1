Write-Host "Starting Flask Server Only" -ForegroundColor Cyan
Write-Host ""

# Get current script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptPath) {
    $scriptPath = $PSScriptRoot
}
if (-not $scriptPath) {
    $scriptPath = Get-Location
}

Write-Host "Project path: $scriptPath" -ForegroundColor Gray
Write-Host ""

# Check and clean port 5000
Write-Host "Checking port 5000..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid = $port5000.OwningProcess
    Write-Host "  WARNING: Port 5000 is in use (PID: $pid), stopping..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  OK: Port 5000 cleaned" -ForegroundColor Green
} else {
    Write-Host "  OK: Port 5000 is available" -ForegroundColor Green
}
Write-Host ""

# Start Flask Backend
Write-Host "Starting Flask Backend (Port 5000)..." -ForegroundColor Yellow
$flaskPath = Join-Path $scriptPath "python-backend"
Write-Host "Flask path: $flaskPath" -ForegroundColor Gray

if (Test-Path $flaskPath) {
    $venvPath = Join-Path $flaskPath "venv"
    $venvActivate = Join-Path $venvPath "Scripts\Activate.ps1"
    
    # Check and create virtual environment
    if (-not (Test-Path $venvPath)) {
        Write-Host "   Creating virtual environment..." -ForegroundColor Gray
        Set-Location $flaskPath
        python -m venv venv
        Set-Location $scriptPath
        Write-Host "   OK: Virtual environment created" -ForegroundColor Green
        Write-Host "   WARNING: After creating venv, you need to install packages:" -ForegroundColor Yellow
        Write-Host "      cd python-backend" -ForegroundColor Gray
        Write-Host "      .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
        Write-Host "      pip install -r requirements.txt" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Start Flask (activate virtual environment)
    if (Test-Path $venvActivate) {
        $flaskCommand = "Set-Location '$flaskPath'; .\venv\Scripts\Activate.ps1; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   Flask Backend (Port 5000)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; python app.py"
    } else {
        $flaskCommand = "Set-Location '$flaskPath'; Write-Host '================================================' -ForegroundColor Cyan; Write-Host '   Flask Backend (Port 5000)' -ForegroundColor Cyan; Write-Host '================================================' -ForegroundColor Cyan; Write-Host ''; python app.py"
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $flaskCommand
    Write-Host "OK: Flask server started (new window)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please wait while the server starts..." -ForegroundColor Gray
    Write-Host "Flask server URL: http://localhost:5000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check server status:" -ForegroundColor Cyan
    Write-Host "  curl http://localhost:5000/api/health" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "ERROR: python-backend folder not found!" -ForegroundColor Red
    Write-Host "   Path: $flaskPath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press Ctrl+C in the Flask window to stop the server." -ForegroundColor Gray
Write-Host ""
pause
