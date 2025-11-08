# 백엔드 연결 문제 진단 및 해결 스크립트
# Backend Connection Troubleshooting Script

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  백엔드 연결 문제 진단" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. 백엔드 서비스 상태 확인
Write-Host "[1/4] 백엔드 서비스 상태 확인..." -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -ErrorAction Stop -TimeoutSec 3
    Write-Host "  OK Backend 서버: 실행 중" -ForegroundColor Green
    Write-Host "     Status: $($backend.status)" -ForegroundColor Gray
} catch {
    Write-Host "  X Backend 서버: 실행되지 않음" -ForegroundColor Red
    Write-Host "     해결 방법: Backend 서버를 시작하세요" -ForegroundColor Yellow
    Write-Host "     명령어: cd backend; .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# 2. 프론트엔드 .env 파일 확인
Write-Host "[2/4] 프론트엔드 환경 변수 확인..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
$envPath = Join-Path $frontendPath ".env"

if (Test-Path $envPath) {
    Write-Host "  OK .env 파일: 존재함" -ForegroundColor Green
    $envContent = Get-Content $envPath
    Write-Host "     내용:" -ForegroundColor Gray
    $envContent | ForEach-Object { Write-Host "       $_" -ForegroundColor Gray }
    
    # VITE_API_URL 확인
    $hasApiUrl = $envContent | Select-String -Pattern "VITE_API_URL"
    if ($hasApiUrl) {
        Write-Host "  OK VITE_API_URL: 설정됨" -ForegroundColor Green
    } else {
        Write-Host "  WARNING VITE_API_URL: 없음 (추가 필요)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  X .env 파일: 없음" -ForegroundColor Red
    Write-Host "     해결 방법: .env 파일 생성 중..." -ForegroundColor Yellow
    
    $envContent = "VITE_API_URL=http://localhost:8080`nVITE_PYTHON_BACKEND_URL=http://localhost:5000"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
    Write-Host "  OK .env 파일 생성 완료" -ForegroundColor Green
}

Write-Host ""

# 3. 백엔드 API 엔드포인트 테스트
Write-Host "[3/4] 백엔드 API 엔드포인트 테스트..." -ForegroundColor Yellow
$testEndpoints = @(
    "http://localhost:8080/actuator/health",
    "http://localhost:8080/api/stocks/search?q=AAPL"
)

foreach ($endpoint in $testEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -Method GET -TimeoutSec 3 -ErrorAction Stop
        Write-Host "  OK $endpoint : OK ($($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  X $endpoint : 실패" -ForegroundColor Red
        Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# 4. CORS 설정 확인
Write-Host "[4/4] CORS 설정 확인..." -ForegroundColor Yellow
Write-Host "  INFO CORS는 WebConfig.java에서 설정됨" -ForegroundColor Gray
Write-Host "     허용된 Origin: http://localhost:5173" -ForegroundColor Gray
Write-Host "     허용된 Origin: http://127.0.0.1:5173" -ForegroundColor Gray

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  해결 방법" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 프론트엔드 재시작 (필수):" -ForegroundColor Yellow
Write-Host "   - 현재 실행 중인 Frontend 서버 중지 (Ctrl+C)" -ForegroundColor White
Write-Host "   - 다시 시작: cd frontend; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. 브라우저 콘솔 확인:" -ForegroundColor Yellow
Write-Host "   - F12로 개발자 도구 열기" -ForegroundColor White
Write-Host "   - Console 탭에서 에러 메시지 확인" -ForegroundColor White
Write-Host "   - Network 탭에서 API 요청 상태 확인" -ForegroundColor White
Write-Host ""
Write-Host "3. 백엔드 로그 확인:" -ForegroundColor Yellow
Write-Host "   - Backend 터미널에서 에러 메시지 확인" -ForegroundColor White
Write-Host ""
Write-Host "4. 환경 변수 확인:" -ForegroundColor Yellow
Write-Host "   - 브라우저 콘솔에서 실행: console.log(import.meta.env.VITE_API_URL)" -ForegroundColor White
Write-Host "   - 예상 값: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
