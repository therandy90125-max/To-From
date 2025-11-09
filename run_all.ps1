# run_all.ps1 - 모든 서비스 실행 (start-all.ps1의 별칭)
# 이 스크립트는 start-all.ps1을 호출합니다.

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  QuantaFolio Navigator" -ForegroundColor Cyan
Write-Host "  모든 서비스 시작" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 현재 스크립트의 디렉토리 가져오기
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptPath) {
    $scriptPath = $PSScriptRoot
}
if (-not $scriptPath) {
    $scriptPath = Get-Location
}

# start-all.ps1 실행
$startAllScript = Join-Path $scriptPath "start-all.ps1"

if (Test-Path $startAllScript) {
    Write-Host "실행 중: $startAllScript" -ForegroundColor Yellow
    Write-Host ""
    & $startAllScript
} else {
    Write-Host "❌ start-all.ps1 파일을 찾을 수 없습니다!" -ForegroundColor Red
    Write-Host "   경로: $startAllScript" -ForegroundColor Gray
    Write-Host ""
    Write-Host "대신 다음 명령어를 사용하세요:" -ForegroundColor Yellow
    Write-Host "   .\start-all.ps1" -ForegroundColor White
    exit 1
}

