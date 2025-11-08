@echo off
chcp 65001 >nul
REM 자동 시작 모드 확인 (시작 프로그램에서 실행된 경우 창을 닫지 않음)
set "AUTO_START=%~1"
if "%AUTO_START%"=="--auto" (
    REM 자동 시작 모드: 백그라운드로 실행하고 창 유지
    set "KEEP_WINDOW=1"
) else (
    REM 수동 실행 모드: 기존 동작 유지
    set "KEEP_WINDOW=0"
)

echo ========================================
echo 🚀 QuantaFolio Navigator 시작
echo ========================================
echo.

REM 환경변수 확인
if not exist .env (
    echo ❌ .env 파일이 없습니다
    echo    .env.example을 복사해서 .env를 만드세요
    pause
    exit /b 1
)

REM 기존 프로세스 종료
echo 🧹 기존 프로세스 정리 중...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM 로그 폴더 생성
if not exist logs mkdir logs

REM 1. Flask Quantum Service 시작
echo.
echo 1️⃣ Flask Quantum Service 시작 (Port 5000)...
cd python-backend
if not exist venv (
    echo    가상환경 생성 중...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt -q
start /B cmd /c "python app.py > ..\logs\quantum.log 2>&1"
cd ..
timeout /t 5 /nobreak >nul

REM 2. Spring Boot Backend 시작
echo.
echo 2️⃣ Spring Boot Backend 시작 (Port 8080)...
cd backend
REM Maven Wrapper 실행 권한 확인
if not exist mvnw.cmd (
    echo ❌ mvnw.cmd 없음 - Maven Wrapper 확인 필요
    cd ..
    pause
    exit /b 1
)
REM 백엔드를 별도 창에서 시작 (로그 확인 가능)
start "QuantaFolio Backend" cmd /k "mvnw.cmd spring-boot:run"
cd ..
echo    백엔드 시작 대기 중 (15초)...
timeout /t 15 /nobreak >nul

REM 3. React Frontend 시작
echo.
echo 3️⃣ React Frontend 시작 (Port 5173)...
cd frontend
if not exist node_modules (
    echo    의존성 설치 중...
    call npm install
)
start /B cmd /c "npm run dev > ..\logs\frontend.log 2>&1"
cd ..

echo.
echo ⏳ 서비스 시작 대기 중 (45초)...
timeout /t 45 /nobreak >nul

REM Health Check
echo.
echo 🔍 서비스 상태 확인...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Quantum Service: OK
) else (
    echo ❌ Quantum Service: FAILED
    echo    로그 확인: type logs\quantum.log
)

REM Backend Health Check (최대 3회 재시도)
set BACKEND_OK=0
for /L %%i in (1,1,3) do (
    curl -s http://localhost:8080/actuator/health >nul 2>&1
    if %errorlevel%==0 (
        echo ✅ Backend: OK
        set BACKEND_OK=1
        goto :backend_check_done
    ) else (
        echo    Backend 대기 중... (%%i/3)
        timeout /t 5 /nobreak >nul
    )
)
:backend_check_done
if %BACKEND_OK%==0 (
    echo ❌ Backend: FAILED - 백엔드 창을 확인하세요
    echo    백엔드가 시작되지 않았습니다. 백엔드 창에서 에러를 확인하세요.
)

curl -s http://localhost:5173 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend: OK
) else (
    echo ❌ Frontend: FAILED
    echo    로그 확인: type logs\frontend.log
)

echo.
echo ========================================
echo 🎉 서비스 시작 완료!
echo ========================================
echo.
echo 📊 접속 주소:
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:8080
echo    Quantum:   http://localhost:5000
echo.
echo 📝 로그 보기:
echo    type logs\quantum.log
echo    type logs\backend.log
echo    type logs\frontend.log
echo.
echo 🛑 종료: stop-all.bat 실행
echo ========================================
echo.
pause

