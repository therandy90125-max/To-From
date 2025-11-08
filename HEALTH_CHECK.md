# 서비스 헬스체크 가이드

## 🔍 빠른 확인 방법

### 방법 1: PowerShell 스크립트 (추천)
```powershell
.\check-health.ps1
```

### 방법 2: Cursor Tasks
1. `Ctrl + Shift + P`
2. `Tasks: Run Task`
3. `🔍 Check All Services Health` 선택

### 방법 3: curl 명령어

#### Backend (Spring Boot)
```powershell
curl http://localhost:8080/actuator/health
```

#### Flask (Quantum Service)
```powershell
curl http://localhost:5000/health
```

#### Frontend (React)
```powershell
curl http://localhost:5173
```

또는 브라우저에서 직접 확인:
- http://localhost:5173

## 📊 예상 응답

### Backend (Spring Boot)
```json
{
  "status": "UP"
}
```

### Flask (Quantum Service)
```json
{
  "status": "healthy",
  "service": "Flask API"
}
```

### Frontend (React)
- HTTP 200 응답
- HTML 페이지 반환

## 🐛 문제 해결

### 연결 실패 시 확인 사항

1. **서비스가 실행 중인지 확인**
   ```powershell
   # 포트 사용 확인
   netstat -ano | findstr :8080
   netstat -ano | findstr :5173
   netstat -ano | findstr :5000
   ```

2. **프로세스 확인**
   ```powershell
   # Java 프로세스 (Spring Boot)
   Get-Process java -ErrorAction SilentlyContinue
   
   # Node 프로세스 (Frontend)
   Get-Process node -ErrorAction SilentlyContinue
   
   # Python 프로세스 (Flask)
   Get-Process python -ErrorAction SilentlyContinue
   ```

3. **방화벽 확인**
   - Windows 방화벽이 로컬 포트를 차단하지 않는지 확인

4. **서비스 재시작**
   ```powershell
   # 모든 서비스 중지
   taskkill /F /IM java.exe /T
   taskkill /F /IM node.exe /T
   taskkill /F /IM python.exe /T
   
   # 다시 시작
   .\start-all.ps1
   ```

## 📝 자동 헬스체크

서비스 시작 후 자동으로 헬스체크를 실행하려면:

```powershell
# 서비스 시작
.\start-all.ps1

# 잠시 대기 (서비스 시작 시간)
Start-Sleep -Seconds 20

# 헬스체크 실행
.\check-health.ps1
```

## 🔧 고급 사용법

### JSON 형식으로 확인
```powershell
# Backend
Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" | ConvertTo-Json

# Flask
Invoke-RestMethod -Uri "http://localhost:5000/health" | ConvertTo-Json
```

### 상세 정보 확인 (Backend)
```powershell
# 모든 헬스 정보
curl http://localhost:8080/actuator/health

# 특정 컴포넌트 확인
curl http://localhost:8080/actuator/health/db
curl http://localhost:8080/actuator/health/diskSpace
```

### 지속적인 모니터링
```powershell
# 5초마다 헬스체크
while ($true) {
    Clear-Host
    .\check-health.ps1
    Start-Sleep -Seconds 5
}
```

## 📚 관련 문서

- [Cursor Tasks 가이드](.vscode/README_TASKS.md)
- [빠른 시작 가이드](QUICK_START_COMMANDS.md)

