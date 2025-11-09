# 🚀 Quick Start Commands

## 모든 서비스 실행 방법

### 방법 1: PowerShell 스크립트 (권장) ⭐

```powershell
cd C:\Users\user\Project\To-From
.\start-all.ps1
```

또는:

```powershell
cd C:\Users\user\Project\To-From
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```

### 방법 2: Batch 파일

```cmd
cd C:\Users\user\Project\To-From
start-all.bat
```

### 방법 3: VS Code / Cursor Tasks

1. **Ctrl + Shift + P** (또는 **Cmd + Shift + P** on Mac)
2. 입력: `Tasks: Run Task`
3. 선택: **"Start All Services"**

### 방법 4: 수동 실행 (3개 터미널)

#### 터미널 1: Flask Backend (Port 5000)
```powershell
cd C:\Users\user\Project\To-From\python-backend
.\venv\Scripts\Activate.ps1
python app.py
```

#### 터미널 2: Spring Boot Backend (Port 8080)
```powershell
cd C:\Users\user\Project\To-From\backend
.\mvnw.cmd spring-boot:run
```

#### 터미널 3: React Frontend (Port 5173)
```powershell
cd C:\Users\user\Project\To-From\frontend
npm run dev
```

---

## 서비스 상태 확인

### Health Check 스크립트
```powershell
cd C:\Users\user\Project\To-From
.\check-health.ps1
```

또는 VS Code/Cursor:
- **Ctrl + Shift + P** → `Tasks: Run Task` → **"Check All Services"**

### 수동 확인
```powershell
# Flask Backend
curl http://localhost:5000/api/health

# Spring Boot Backend
curl http://localhost:8080/actuator/health

# Frontend (브라우저)
# http://localhost:5173
```

---

## 서비스 중지

### 방법 1: PowerShell 스크립트
```powershell
cd C:\Users\user\Project\To-From
.\stop-all.bat
```

### 방법 2: VS Code/Cursor Tasks
- **Ctrl + Shift + P** → `Tasks: Run Task` → **"Stop All Services"**

### 방법 3: 수동 중지
각 터미널에서 **Ctrl + C** 누르기

---

## 서비스 URL

| 서비스 | URL | 포트 |
|--------|-----|------|
| **Frontend** | http://localhost:5173 | 5173 |
| **Spring Boot** | http://localhost:8080 | 8080 |
| **Flask** | http://localhost:5000 | 5000 |

---

## 문제 해결

### 백엔드 연결 안됨
```powershell
cd C:\Users\user\Project\To-From
.\fix-backend-connection.ps1
```

### 모든 서비스 재시작
1. 모든 서비스 중지
2. `start-all.ps1` 다시 실행

---

## 빠른 참조

```powershell
# 프로젝트 루트로 이동
cd C:\Users\user\Project\To-From

# 모든 서비스 시작
.\start-all.ps1

# 상태 확인
.\check-health.ps1

# 모든 서비스 중지
.\stop-all.bat
```
