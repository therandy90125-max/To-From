# 백엔드 연결 문제 해결 가이드

## 🔍 문제 진단

### 1. 진단 스크립트 실행
```powershell
cd C:\Users\user\Project\To-From
.\diagnose-backend.ps1
```

### 2. 수동 확인

#### 프로세스 확인
```powershell
# Java (Spring Boot)
Get-Process java -ErrorAction SilentlyContinue

# Python (Flask)
Get-Process python -ErrorAction SilentlyContinue

# Node (Frontend)
Get-Process node -ErrorAction SilentlyContinue
```

#### 포트 확인
```powershell
# 포트 8080 (Spring Boot)
netstat -ano | findstr :8080

# 포트 5000 (Flask)
netstat -ano | findstr :5000

# 포트 5173 (Frontend)
netstat -ano | findstr :5173
```

#### HTTP 연결 테스트
```powershell
# Spring Boot
curl http://localhost:8080/actuator/health

# Flask
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:5173
```

## 🛠️ 해결 방법

### 방법 1: 모든 서비스 재시작

1. **모든 서비스 중지**
   ```powershell
   .\stop-all.bat
   ```
   또는 수동:
   ```powershell
   taskkill /F /IM java.exe /T
   taskkill /F /IM python.exe /T
   taskkill /F /IM node.exe /T
   ```

2. **모든 서비스 시작**
   ```powershell
   .\start-all.ps1
   ```

### 방법 2: 개별 서비스 시작

#### Spring Boot (Port 8080)
```powershell
cd C:\Users\user\Project\To-From\backend
.\mvnw.cmd spring-boot:run
```

#### Flask (Port 5000)
```powershell
cd C:\Users\user\Project\To-From\python-backend
.\venv\Scripts\Activate.ps1
python app.py
```

#### Frontend (Port 5173)
```powershell
cd C:\Users\user\Project\To-From\frontend
npm run dev
```

### 방법 3: 포트 충돌 해결

포트가 이미 사용 중인 경우:

```powershell
# 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :8080

# 프로세스 종료 (PID 확인 후)
taskkill /F /PID <PID>
```

## ✅ 확인 사항

1. **백엔드가 실제로 실행 중인가?**
   - PowerShell 창에서 Spring Boot 로그 확인
   - "Started ToAndFromApplication" 메시지 확인

2. **포트가 열려있는가?**
   - `netstat -ano | findstr :8080` 실행
   - LISTENING 상태 확인

3. **방화벽이 차단하지 않는가?**
   - Windows 방화벽 설정 확인
   - 로컬 포트는 일반적으로 문제 없음

4. **CORS 설정이 올바른가?**
   - `backend/src/main/java/.../config/WebConfig.java` 확인
   - `http://localhost:5173` 허용 확인

## 🚨 자주 발생하는 문제

### 문제 1: "백엔드 연결 안됨" 메시지
**원인**: Spring Boot가 시작되지 않았거나 포트 충돌

**해결**:
1. 백엔드 창 확인 (에러 메시지 확인)
2. 포트 8080이 사용 중인지 확인
3. 백엔드 재시작

### 문제 2: PowerShell 실행 정책 오류
**원인**: PowerShell 스크립트 실행이 차단됨

**해결**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 문제 3: Maven Wrapper 없음
**원인**: `mvnw.cmd` 파일이 없음

**해결**:
```powershell
cd backend
# Maven이 설치되어 있다면
mvn spring-boot:run
```

## 📝 체크리스트

- [ ] Spring Boot 프로세스 실행 중 (java.exe)
- [ ] Flask 프로세스 실행 중 (python.exe)
- [ ] Frontend 프로세스 실행 중 (node.exe)
- [ ] 포트 8080 LISTENING
- [ ] 포트 5000 LISTENING
- [ ] 포트 5173 LISTENING
- [ ] `http://localhost:8080/actuator/health` 응답
- [ ] `http://localhost:5000/api/health` 응답
- [ ] `http://localhost:5173` 접속 가능

## 💡 빠른 해결

```powershell
# 1. 모든 서비스 중지
.\stop-all.bat

# 2. 5초 대기
Start-Sleep -Seconds 5

# 3. 모든 서비스 시작
.\start-all.ps1

# 4. 30초 대기 (서비스 시작 시간)
Start-Sleep -Seconds 30

# 5. 상태 확인
.\check-health.ps1
```

