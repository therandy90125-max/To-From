# Flask Server with UTF-8 Encoding
# Windows cp949 인코딩 문제 해결을 위한 UTF-8 설정

Write-Host "Starting Flask Server with UTF-8 encoding..." -ForegroundColor Cyan
Write-Host ""

# UTF-8 인코딩 설정
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "  PYTHONIOENCODING = $env:PYTHONIOENCODING" -ForegroundColor Gray
Write-Host "  PYTHONUTF8 = $env:PYTHONUTF8" -ForegroundColor Gray
Write-Host ""

# python-backend 디렉토리로 이동
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonBackendPath = Join-Path $scriptPath "python-backend"

if (-not (Test-Path $pythonBackendPath)) {
    Write-Host "Error: python-backend directory not found!" -ForegroundColor Red
    Write-Host "Expected path: $pythonBackendPath" -ForegroundColor Red
    exit 1
}

Set-Location $pythonBackendPath
Write-Host "Changed to directory: $pythonBackendPath" -ForegroundColor Gray
Write-Host ""

# 가상환경 확인 및 활성화
$venvPath = Join-Path $pythonBackendPath "venv"
if (Test-Path $venvPath) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
        Write-Host "Virtual environment activated" -ForegroundColor Green
    }
} else {
    Write-Host "Virtual environment not found. Using system Python." -ForegroundColor Yellow
}
Write-Host ""

# Flask 서버 시작
Write-Host "Starting Flask server..." -ForegroundColor Green
Write-Host "Server will be available at: http://127.0.0.1:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

python app.py

