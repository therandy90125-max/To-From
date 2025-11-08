@echo off
chcp 65001 >nul
echo ========================================
echo 🔧 QuantaFolio 자동 시작 설치
echo ========================================
echo.

REM 현재 스크립트의 경로 가져오기
set "SCRIPT_DIR=%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo 📁 시작 프로그램 폴더: %STARTUP_FOLDER%
echo 📁 스크립트 경로: %SCRIPT_DIR%
echo.

REM 시작 프로그램 폴더에 바로가기 생성
echo 🔗 자동 시작 바로가기 생성 중...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_FOLDER%\QuantaFolio Navigator.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%start-all.bat'; $Shortcut.Arguments = '--auto'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'QuantaFolio Navigator 자동 시작'; $Shortcut.WindowStyle = 1; $Shortcut.Save()"

if %errorlevel%==0 (
    echo ✅ 자동 시작 설정 완료!
    echo.
    echo 📝 다음 부팅 시 자동으로 시작됩니다.
    echo.
    echo 🛑 자동 시작을 해제하려면:
    echo    시작 프로그램 폴더에서 "QuantaFolio Navigator" 바로가기를 삭제하세요.
    echo    또는 uninstall-autostart.bat를 실행하세요.
) else (
    echo ❌ 자동 시작 설정 실패
    echo    관리자 권한으로 실행해보세요.
)

echo.
pause

