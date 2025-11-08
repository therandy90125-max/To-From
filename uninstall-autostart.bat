@echo off
chcp 65001 >nul
echo ========================================
echo 🗑️ QuantaFolio 자동 시작 제거
echo ========================================
echo.

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=QuantaFolio Navigator.lnk"

if exist "%STARTUP_FOLDER%\%SHORTCUT_NAME%" (
    del "%STARTUP_FOLDER%\%SHORTCUT_NAME%"
    if %errorlevel%==0 (
        echo ✅ 자동 시작 제거 완료!
        echo    다음 부팅 시 자동으로 시작되지 않습니다.
    ) else (
        echo ❌ 자동 시작 제거 실패
    )
) else (
    echo ℹ️ 자동 시작이 설정되어 있지 않습니다.
)

echo.
pause

