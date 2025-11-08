# 🚀 빠른 시작 가이드 (Quick Start Guide)

**프론트엔드 + 백엔드 동시 시작 방법**

---

## ⚡ 가장 빠른 방법

### Windows (PowerShell)
```powershell
# 프로젝트 루트에서 실행
.\start-all.ps1
```

또는 더 상세한 버전:
```powershell
.\start-dev.ps1
```

### Linux/Mac (Bash)
```bash
# 각 터미널에서 개별 실행
# Terminal 1: Flask
cd python-backend && python app.py

# Terminal 2: Spring Boot
cd backend && ./mvnw spring-boot:run

# Terminal 3: React
cd frontend && npm run dev
```

---

## 📋 서비스 포트

| 서비스 | 포트 | URL |
|--------|------|-----|
| Flask Backend | 5000 | http://localhost:5000 |
| Spring Boot | 8080 | http://localhost:8080 |
| React Frontend | 5173 | http://localhost:5173 |

---

## 🎯 start-all.ps1 사용법

### 기본 실행
```powershell
.\start-all.ps1
```

**기능:**
- ✅ Flask 백엔드 자동 시작 (새 창)
- ✅ Spring Boot 자동 시작 (새 창)
- ✅ React 프론트엔드 자동 시작 (새 창)
- ✅ 브라우저 자동 열기

**실행 순서:**
1. Flask 시작 (3초 대기)
2. Spring Boot 시작 (8초 대기)
3. React 시작 (10초 대기)
4. 브라우저 열기

---

## 🛠️ start-dev.ps1 사용법 (고급)

### 기본 실행
```powershell
.\start-dev.ps1
```

### 옵션 사용
```powershell
# 기존 프로세스 종료 후 시작
.\start-dev.ps1 -StopFirst

# 상세 로그 출력
.\start-dev.ps1 -Verbose
```

**추가 기능:**
- ✅ 포트 상태 확인
- ✅ 서비스 실행 확인
- ✅ 기존 프로세스 자동 종료 옵션
- ✅ 상세 로그 출력

---

## 🛑 서비스 종료

### Windows
```powershell
.\stop-all.ps1
```

또는 각 PowerShell 창에서 `Ctrl+C`

### Linux/Mac
각 터미널에서 `Ctrl+C`

---

## 🔧 수동 시작 (개별 실행)

### 1. Flask Backend
```powershell
cd python-backend
python app.py
```

### 2. Spring Boot
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### 3. React Frontend
```powershell
cd frontend
npm run dev
```

---

## ✅ 시작 확인

### 포트 확인
```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 5000,8080,5173 | Select-Object LocalPort, State

# 또는
netstat -an | findstr "5000 8080 5173"
```

### 브라우저에서 확인
- Flask: http://localhost:5000/api/health
- Spring Boot: http://localhost:8080/api/health
- Frontend: http://localhost:5173

---

## 🐛 문제 해결

### 문제 1: 포트가 이미 사용 중
**해결:**
```powershell
# 기존 프로세스 종료 후 시작
.\start-dev.ps1 -StopFirst
```

### 문제 2: Python이 없음
**해결:**
```powershell
# Python 설치 확인
python --version

# 또는 Python 경로 확인
where python
```

### 문제 3: Maven Wrapper 없음
**해결:**
```powershell
cd backend
# Maven Wrapper 생성 또는 Maven 직접 사용
mvn spring-boot:run
```

### 문제 4: Node modules 없음
**해결:**
```powershell
cd frontend
npm install
```

---

## 📊 시작 시간

| 서비스 | 시작 시간 | 총 대기 시간 |
|--------|----------|-------------|
| Flask | ~3초 | 3초 |
| Spring Boot | ~10-15초 | 13-18초 |
| React | ~5-8초 | 18-26초 |

**총 예상 시간: 약 20-30초**

---

## 🎬 추천 워크플로우

### 개발 시작
```powershell
# 1. 프로젝트 루트로 이동
cd To-From

# 2. 모든 서비스 시작
.\start-all.ps1

# 3. 브라우저에서 http://localhost:5173 접속
```

### 개발 종료
```powershell
# 모든 서비스 종료
.\stop-all.ps1
```

---

## 💡 팁

1. **첫 실행 시**: `start-dev.ps1` 사용 (포트 확인 및 종료 기능)
2. **일반 개발**: `start-all.ps1` 사용 (빠른 시작)
3. **디버깅**: 각 서비스를 개별 터미널에서 실행

---

**준비 완료!** 🎉

