@echo off
chcp 65001 >nul
echo 🛑 QuantaFolio Navigator 종료 중...
echo.

REM 모든 관련 프로세스 종료
echo 프로세스 종료 중...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul

REM 포트별로 강제 종료
echo 포트 정리 중...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo ✅ 모든 서비스 종료 완료
echo.
timeout /t 2 /nobreak >nul

