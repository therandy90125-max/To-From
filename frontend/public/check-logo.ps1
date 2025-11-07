# Check if QuantaFolio logo has been added
$logoPath = "quantafolio-logo.png"

Write-Host "`n=== QuantaFolio Navigator Logo Check ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $logoPath) {
    $file = Get-Item $logoPath
    Write-Host "[✓] Logo found!" -ForegroundColor Green
    Write-Host "    File: $($file.Name)" -ForegroundColor White
    Write-Host "    Size: $([math]::Round($file.Length / 1KB, 2)) KB" -ForegroundColor White
    Write-Host "    Modified: $($file.LastWriteTime)" -ForegroundColor White
    Write-Host ""
    Write-Host "[✓] Logo is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The logo will appear in:" -ForegroundColor Yellow
    Write-Host "  • Sidebar (180px width)" -ForegroundColor White
    Write-Host "  • Browser tab (favicon)" -ForegroundColor White
    Write-Host ""
    Write-Host "Refresh your browser to see the logo!" -ForegroundColor Cyan
} else {
    Write-Host "[✗] Logo not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please save the image as: quantafolio-logo.png" -ForegroundColor Yellow
    Write-Host "Current location: $PWD" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Steps to add logo:" -ForegroundColor Yellow
    Write-Host "  1. Right-click the QuantaFolio image" -ForegroundColor White
    Write-Host "  2. Select 'Save Image As...'" -ForegroundColor White
    Write-Host "  3. Save to this folder as 'quantafolio-logo.png'" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

