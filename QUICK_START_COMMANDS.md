# 빠른 시작 명령어 가이드

## 프로젝트 위치
프로젝트는 `C:\Users\user\Project\To-From`에 있습니다.

## 모든 서비스 동시 시작

### PowerShell에서:
```powershell
# 1. 프로젝트 폴더로 이동
cd C:\Users\user\Project\To-From

# 2. 스크립트 실행
.\start-all.ps1
```

### CMD에서:
```cmd
# 1. 프로젝트 폴더로 이동
cd C:\Users\user\Project\To-From

# 2. 스크립트 실행
start-all.bat
```

## 개별 서비스 시작

### Flask Backend (Port 5000)
```powershell
cd C:\Users\user\Project\To-From\python-backend
.\venv\Scripts\Activate.ps1
python app.py
```

### Spring Boot Backend (Port 8080)
```powershell
cd C:\Users\user\Project\To-From\backend
.\mvnw.cmd spring-boot:run
```

### React Frontend (Port 5173)
```powershell
cd C:\Users\user\Project\To-From\frontend
npm run dev
```

## 문제 해결

### "start-all.ps1을 찾을 수 없습니다" 오류
- 현재 디렉토리가 `C:\Users\user\Project`인 경우:
  ```powershell
  cd To-From
  .\start-all.ps1
  ```

### "backend 폴더를 찾을 수 없습니다" 오류
- 올바른 경로 확인:
  ```powershell
  cd C:\Users\user\Project\To-From
  ls  # backend, frontend, python-backend 폴더가 보여야 함
  ```

### PowerShell 실행 정책 오류
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 접속 주소
- Frontend: http://localhost:5173
- Spring Boot Backend: http://localhost:8080
- Flask Backend: http://localhost:5000

