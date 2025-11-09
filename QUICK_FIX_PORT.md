# 포트 충돌 문제 해결

## 🚨 문제: "Port 8080 was already in use"

Spring Boot가 시작되지 않는 경우, 포트가 이미 사용 중일 수 있습니다.

## 🔧 빠른 해결 방법

### 방법 1: 자동 정리 스크립트 (권장)

```powershell
cd C:\Users\user\Project\To-From
.\fix-port-conflict.ps1
.\start-all.ps1
```

### 방법 2: 수동 정리

```powershell
# 포트 8080 사용 중인 프로세스 찾기
netstat -ano | findstr :8080

# 프로세스 종료 (PID 확인 후)
taskkill /F /PID <PID>

# 또는 모든 Java 프로세스 종료
taskkill /F /IM java.exe
```

### 방법 3: 모든 서비스 중지 후 재시작

```powershell
# 모든 서비스 중지
.\stop-all.bat

# 잠시 대기
Start-Sleep -Seconds 3

# 다시 시작
.\start-all.ps1
```

## 📋 포트 사용 확인

```powershell
# 포트 8080 (Spring Boot)
netstat -ano | findstr :8080

# 포트 5000 (Flask)
netstat -ano | findstr :5000

# 포트 5173 (Frontend)
netstat -ano | findstr :5173
```

## ✅ 확인 사항

- [ ] 포트 8080이 비어있음
- [ ] 포트 5000이 비어있음
- [ ] 포트 5173이 비어있음
- [ ] Java 프로세스가 실행 중이지 않음

## 💡 예방 방법

`start-all.ps1` 스크립트가 자동으로 포트를 정리하도록 개선되었습니다.
이제 스크립트 실행 시 자동으로 포트 충돌을 해결합니다.

