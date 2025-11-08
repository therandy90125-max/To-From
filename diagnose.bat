@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 QuantaFolio 상태 진단
echo ========================================
echo.

REM Java 확인
echo [1/8] Java 설치 확인...
java -version 2>nul
if %errorlevel%==0 (
    echo ✅ Java 설치됨
) else (
    echo ❌ Java 설치 안됨 - JDK 17 설치 필요
)
echo.

REM Python 확인
echo [2/8] Python 설치 확인...
python --version 2>nul
if %errorlevel%==0 (
    echo ✅ Python 설치됨
) else (
    echo ❌ Python 설치 안됨
)
echo.

REM Node.js 확인
echo [3/8] Node.js 설치 확인...
node --version 2>nul
if %errorlevel%==0 (
    echo ✅ Node.js 설치됨
) else (
    echo ❌ Node.js 설치 안됨
)
echo.

REM Maven 확인
echo [4/8] Maven 확인...
if exist backend\mvnw.cmd (
    echo ✅ Maven Wrapper 존재
) else (
    echo ❌ Maven Wrapper 없음
)
echo.

REM 포트 사용 확인
echo [5/8] 포트 사용 상태 확인...
netstat -ano | findstr :5000
netstat -ano | findstr :8080
netstat -ano | findstr :5173
echo.

REM 프로세스 확인
echo [6/8] 실행 중인 프로세스...
tasklist | findstr java.exe
tasklist | findstr python.exe
tasklist | findstr node.exe
echo.

REM 파일 구조 확인
echo [7/8] 프로젝트 구조 확인...
if exist backend\src\main\java (echo ✅ Backend 코드 존재) else (echo ❌ Backend 코드 없음)
if exist frontend\src (echo ✅ Frontend 코드 존재) else (echo ❌ Frontend 코드 없음)
if exist python-backend\app.py (echo ✅ Quantum Service 코드 존재) else (echo ❌ Quantum Service 코드 없음)
echo.

REM application.properties 확인
echo [8/8] Backend 설정 확인...
if exist backend\src\main\resources\application.properties (
    echo ✅ application.properties 존재
    type backend\src\main\resources\application.properties
) else (
    echo ❌ application.properties 없음
)
echo.

echo ========================================
echo 📊 진단 완료
echo ========================================
echo.
echo 이 결과를 복사해서 Claude에게 보내주세요.
echo.
pause

