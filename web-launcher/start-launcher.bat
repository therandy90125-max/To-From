@echo off
chcp 65001 >nul
echo ========================================
echo 🌐 QuantaFolio Web Launcher 시작
echo ========================================
echo.

cd /d "%~dp0"

REM 가상환경 확인 및 생성
if not exist venv (
    echo 가상환경 생성 중...
    python -m venv venv
)

REM 가상환경 활성화
call venv\Scripts\activate.bat

REM 패키지 설치
echo 패키지 설치 중...
pip install -r requirements.txt -q

REM 웹 런처 시작
echo.
echo ========================================
echo 🌐 웹 런처가 시작되었습니다!
echo ========================================
echo.
echo 브라우저에서 다음 주소를 열어주세요:
echo    http://localhost:8888
echo.
echo ========================================
echo.

python app.py

pause

