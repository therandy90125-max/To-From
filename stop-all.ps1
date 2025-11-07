Write-Host "🛑 QuantaFolio Navigator 종료 중..." -ForegroundColor Red

$ports = @(5000, 8080, 5173)

foreach ($port in $ports) {
    Write-Host "`nPort $port 확인 중..." -ForegroundColor Yellow
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  종료: $($process.Name) (PID: $($process.Id))" -ForegroundColor Gray
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                }
            }
            Write-Host "  ✅ Port $port 정리 완료" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  Port $port - 실행 중인 프로세스 없음" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠️  Port $port 확인 중 오류" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ 모든 서비스 종료 완료!" -ForegroundColor Green
pause

