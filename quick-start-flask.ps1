# Quick Flask Server Start Script
Write-Host "Starting Flask Server..." -ForegroundColor Cyan
Write-Host ""

$flaskPath = "C:\Users\user\Project\To-From\python-backend"

if (Test-Path $flaskPath) {
    Set-Location $flaskPath
    
    # Check if virtual environment exists
    $venvPath = Join-Path $flaskPath "venv"
    if (Test-Path $venvPath) {
        Write-Host "Activating virtual environment..." -ForegroundColor Yellow
        & "$venvPath\Scripts\Activate.ps1"
    } else {
        Write-Host "Virtual environment not found. Using system Python." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Starting Flask server on http://127.0.0.1:5000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    
    # Start Flask
    python app.py
} else {
    Write-Host "ERROR: Flask path not found: $flaskPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the path and try again." -ForegroundColor Yellow
    pause
}

