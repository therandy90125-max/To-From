# PowerShell script to save QuantaFolio logo
# Usage: Save your logo as quantafolio-logo.png in this directory

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  QuantaFolio Navigator Logo Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Locate your QuantaFolio logo image" -ForegroundColor White
Write-Host "2. Rename it to: quantafolio-logo.png" -ForegroundColor Green
Write-Host "3. Copy it to this folder:" -ForegroundColor White
Write-Host "   $PSScriptRoot" -ForegroundColor Gray
Write-Host ""
Write-Host "Or use Windows Explorer:" -ForegroundColor Yellow
Write-Host "- Right-click the image file" -ForegroundColor White
Write-Host "- Select 'Copy'" -ForegroundColor White
Write-Host "- Paste into: frontend\public\" -ForegroundColor White
Write-Host "- Rename to: quantafolio-logo.png" -ForegroundColor Green
Write-Host ""
Write-Host "After saving the logo, restart the dev server:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

# Open the folder in Explorer
explorer.exe $PSScriptRoot

