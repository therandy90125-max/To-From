# 🌐 QuantaFolio Navigator Web Launcher

웹 브라우저에서 QuantaFolio Navigator 서비스를 시작하고 관리할 수 있는 웹 인터페이스입니다.

## 🚀 사용 방법

### 1. 웹 런처 시작

```batch
start-launcher.bat
```

또는 직접 실행:

```batch
cd web-launcher
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. 브라우저에서 접속

웹 런처가 시작되면 자동으로 브라우저가 열리거나, 다음 주소를 직접 입력하세요:

```
http://localhost:8888
```

### 3. 서비스 시작

웹 페이지에서 **"시작"** 버튼을 클릭하면:
- Flask Quantum Service (포트 5000)
- Spring Boot Backend (포트 8080)
- React Frontend (포트 5173)

모든 서비스가 자동으로 시작됩니다!

### 4. 서비스 중지

**"중지"** 버튼을 클릭하면 모든 서비스가 종료됩니다.

## 📋 기능

- ✅ 실시간 서비스 상태 확인
- ✅ 원클릭 서비스 시작/중지
- ✅ 자동 상태 새로고침 (5초마다)
- ✅ 빠른 링크 제공 (Frontend, Backend, Quantum)

## 🔧 문제 해결

### 웹 런처가 시작되지 않는 경우

1. Python이 설치되어 있는지 확인:
   ```batch
   python --version
   ```

2. 포트 8888이 사용 중인지 확인:
   ```batch
   netstat -ano | findstr :8888
   ```

3. 방화벽 설정 확인

### 서비스가 시작되지 않는 경우

1. `start-all.bat` 파일이 프로젝트 루트에 있는지 확인
2. 관리자 권한으로 실행해보기
3. 웹 런처 로그 확인

## 📝 참고사항

- 웹 런처는 포트 8888에서 실행됩니다
- 서비스 시작에는 약 30-60초가 소요될 수 있습니다
- 서비스가 시작되면 자동으로 Frontend가 새 탭에서 열립니다

