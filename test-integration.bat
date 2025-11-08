@echo off
chcp 65001 >nul
echo ========================================
echo 🧪 QuantaFolio 통합 테스트
echo ========================================
echo.

REM 1. 백엔드 Health Check
echo 1️⃣ 백엔드 연결 테스트...
curl -s http://localhost:8080/actuator/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 백엔드: OK
) else (
    echo ❌ 백엔드: FAILED - start-all.bat을 실행했는지 확인하세요
    pause
    exit /b 1
)
echo.

REM 2. Stock API Health Check
echo 2️⃣ Stock API 테스트...
curl -s http://localhost:8080/api/stocks/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Stock API: OK
) else (
    echo ❌ Stock API: FAILED
)
echo.

REM 3. US Stock Search Test
echo 3️⃣ 미국 주식 검색 테스트 (AAPL)...
curl -s "http://localhost:8080/api/stocks/search?query=AAPL"
echo.
echo.

REM 4. Korean Stock Search Test
echo 4️⃣ 한국 주식 검색 테스트 (삼성전자)...
curl -s "http://localhost:8080/api/stocks/search?query=005930.KS"
echo.
echo.

REM 5. Currency API Test
echo 5️⃣ 환율 API 테스트 (USD to KRW)...
curl -s "http://localhost:8080/api/currency/rate?from=USD&to=KRW"
echo.
echo.

REM 6. Frontend Test
echo 6️⃣ 프론트엔드 연결 테스트...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 프론트엔드: OK
) else (
    echo ❌ 프론트엔드: FAILED
)
echo.

REM 7. Quantum Service Test
echo 7️⃣ 양자 서비스 연결 테스트...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 양자 서비스: OK
) else (
    echo ❌ 양자 서비스: FAILED - Flask 서비스가 실행 중인지 확인하세요
)
echo.

echo ========================================
echo 🎉 통합 테스트 완료
echo ========================================
echo.
echo 다음 단계:
echo 1. 브라우저에서 http://localhost:5173 접속
echo 2. Language Switcher (우측 상단) 확인
echo 3. "AAPL" 검색 테스트
echo 4. 검색 결과에 USD 가격 표시 확인
echo 5. F12 → Console 탭에서 에러 없는지 확인
echo.
pause

