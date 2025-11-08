@echo off
chcp 65001 >nul
echo 🧹 모든 프로세스 강제 종료...

REM 모든 관련 프로세스 종료
taskkill /F /IM java.exe 2>nul
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul

REM 포트별 강제 종료 (PID 기반)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo ✅ 정리 완료
timeout /t 3

echo.
echo 🔍 포트 상태 재확인...
netstat -ano | findstr :5000
netstat -ano | findstr :8080
netstat -ano | findstr :5173

echo.
echo 아무것도 안 나와야 정상입니다.
pause

