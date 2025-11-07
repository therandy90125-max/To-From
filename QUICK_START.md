# 🚀 QuantaFolio Navigator - Quick Start Guide

## ⚡ 빠른 실행 (권장)

### 방법 1: PowerShell 스크립트 (가장 안정적)

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\user\Project\To-From

# 모든 서버 시작 (자동 모니터링)
.\start-dev.ps1

# 또는 기존 프로세스 종료 후 시작
.\start-dev.ps1 -StopFirst

# 서버 종료
.\stop-all.ps1
```

### 방법 2: NPM Script (하나의 터미널)

```powershell
# 1. Concurrently 설치 (최초 1회만)
npm install

# 2. 모든 서버 동시 실행
npm run dev

# 3. 종료: Ctrl+C
```

### 방법 3: 수동 실행 (디버깅용)

```powershell
# 터미널 1: Flask
cd python-backend
python app.py

# 터미널 2: Spring Boot
cd backend
.\mvnw spring-boot:run

# 터미널 3: React
cd frontend
npm run dev
```

## 📋 서버 확인

실행 후 다음 URL에서 확인:

- **Frontend**: http://localhost:5173
- **Spring Boot**: http://localhost:8080
- **Flask**: http://localhost:5000

## 🔍 문제 해결

### 1. "Port already in use" 오류

```powershell
# 모든 서버 강제 종료
.\stop-all.ps1

# 또는 수동으로
netstat -ano | findstr "5000 8080 5173"
# PID 확인 후
taskkill /PID <PID> /F
```

### 2. Flask 서버가 시작 안 됨

```powershell
cd python-backend

# Python 가상환경 확인
python --version

# 의존성 재설치
pip install -r requirements.txt

# 수동 실행
python app.py
```

### 3. Spring Boot 서버가 시작 안 됨

```powershell
cd backend

# Maven Wrapper 권한 확인
.\mvnw --version

# 캐시 정리 후 재실행
.\mvnw clean
.\mvnw spring-boot:run
```

### 4. React 서버가 시작 안 됨

```powershell
cd frontend

# node_modules 재설치
Remove-Item -Recurse -Force node_modules
npm install

# 수동 실행
npm run dev
```

## 🛠️ 개발 환경 요구사항

### 필수 소프트웨어

- **Node.js**: 18.0.0 이상
- **Python**: 3.10 이상
- **Java**: 17 이상 (Spring Boot)
- **Maven**: 3.8 이상 (Spring Boot에 포함)

### 설치 확인

```powershell
node --version   # v18.x.x 이상
python --version # 3.10.x 이상
java --version   # 17.x.x 이상
```

## 📊 서비스 아키텍처

```
┌─────────────────┐
│  React (5173)   │
└────────┬────────┘
         │ /api/*
         ↓
┌─────────────────┐
│ Spring Boot     │
│   (8080)        │
└────────┬────────┘
         │ proxy
         ↓
┌─────────────────┐
│  Flask (5000)   │
│  + Qiskit       │
│  + yfinance     │
└─────────────────┘
```

## 🎯 실행 순서

1. **Flask** (5000) - 3초 대기
2. **Spring Boot** (8080) - 10-30초 대기 (첫 실행 시 더 오래 걸림)
3. **React** (5173) - 8초 대기
4. **브라우저 자동 오픈**

## 💡 유용한 명령어

```powershell
# 전체 의존성 설치
npm run install:all

# 서버 상태 확인
netstat -ano | findstr "5000 8080 5173"

# 로그 확인 (각 서버 창에서)
# Flask: python-backend 창
# Spring Boot: backend 창
# React: frontend 창

# Git 상태 확인
git status

# 변경사항 커밋
git add -A
git commit -m "커밋 메시지"
```

## 🐛 디버깅 모드

### Flask 디버그 모드

```python
# python-backend/app.py 마지막 줄
if __name__ == '__main__':
    app.run(debug=True, port=5000)  # debug=True
```

### Spring Boot 디버그 모드

```powershell
cd backend
.\mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### React 디버그 모드

```powershell
cd frontend
# Vite는 기본적으로 디버그 모드
npm run dev
```

## 📝 로그 위치

- **Flask**: 콘솔 출력
- **Spring Boot**: `backend/target/` 또는 콘솔
- **React**: 콘솔 출력 + 브라우저 DevTools

## ⚙️ 환경 설정

### 포트 변경이 필요한 경우

1. **Flask**: `python-backend/app.py` - `port=5000`
2. **Spring Boot**: `backend/src/main/resources/application.yml` - `server.port: 8080`
3. **React**: `frontend/vite.config.js` - `port: 5173`

포트 변경 시 프록시 설정도 함께 수정해야 합니다!

## 🔒 보안

개발 환경에서는 다음 설정이 적용됩니다:

- CORS: 모든 출처 허용 (개발 전용)
- H2 Database: 메모리 모드
- 디버그 로그 활성화

**프로덕션 배포 전 반드시 보안 설정을 강화하세요!**

## 📚 추가 문서

- [아키텍처 가이드](ARCHITECTURE.md)
- [설정 가이드](SETUP_GUIDE.md)
- [테스트 가이드](TEST_GUIDE.md)
- [리팩토링 가이드](REFACTORING_GUIDE.md)

## 🆘 도움이 필요하신가요?

1. 각 서버 창의 에러 메시지 확인
2. `netstat -ano | findstr "5000 8080 5173"` 실행
3. `stop-all.ps1` 실행 후 재시작
4. 문제가 지속되면 이슈 리포트 작성

---

**Happy Coding! 🚀**

