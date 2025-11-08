@echo off
chcp 65001 >nul
echo 🔧 .env 파일 생성 중...
echo.

REM .env 파일 생성
(
echo # ===============================
echo # QuantaFolio Navigator 환경변수
echo # ===============================
echo.
echo # Alpha Vantage API Key ^(주식 데이터 API^)
echo # 무료 키 발급: https://www.alphavantage.co/support/#api-key
echo ALPHA_VANTAGE_API_KEY=demo
echo.
echo # Backend URL
echo VITE_BACKEND_URL=http://localhost:8080
echo.
echo # Database Configuration
echo SPRING_DATASOURCE_URL=jdbc:h2:mem:quantafolio
echo SPRING_DATASOURCE_USERNAME=sa
echo SPRING_DATASOURCE_PASSWORD=
echo.
echo # Service URLs
echo QUANTUM_SERVICE_URL=http://localhost:5000
echo.
echo # Environment
echo NODE_ENV=development
echo SPRING_PROFILES_ACTIVE=dev
echo FLASK_ENV=development
) > .env

echo ✅ .env 파일이 생성되었습니다!
echo.
echo 📝 .env 파일 내용:
echo ----------------------------------------
type .env
echo ----------------------------------------
echo.
echo ⚠️  중요: ALPHA_VANTAGE_API_KEY를 실제 키로 변경하세요
echo    1. https://www.alphavantage.co/support/#api-key 접속
echo    2. 이메일 입력하고 무료 키 받기
echo    3. .env 파일 열어서 'demo'를 받은 키로 교체
echo.
echo 지금은 'demo' 키로도 테스트 가능합니다.
echo.
pause

