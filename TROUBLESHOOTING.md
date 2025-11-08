# 🔧 문제 해결 가이드 (Troubleshooting Guide)

**Spring Boot 연결 실패 문제 해결**

---

## 🐛 현재 문제

**증상:**
```
Spring Boot 연결 실패, Flask로 직접 연결 시도...
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**원인:** Spring Boot 서버가 실행되지 않음

---

## ✅ 해결 방법

### 방법 1: Spring Boot 시작 (권장)

**PowerShell에서:**
```powershell
# Spring Boot만 시작
.\start-spring-boot.ps1

# 또는 모든 서비스 시작
.\start-all.ps1
```

**수동 시작:**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### 방법 2: Flask만 사용 (임시 해결)

Spring Boot 없이 Flask만 사용하려면:

**vite.config.js 수정:**
```javascript
proxy: {
  "/api": {
    target: "http://127.0.0.1:5000",  // Flask로 직접 연결
    changeOrigin: true,
  }
}
```

---

## 🔍 서비스 상태 확인

### 포트 확인
```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 5000,8080,5173 | Select-Object LocalPort, State

# 또는
netstat -an | findstr "5000 8080 5173"
```

### 서비스 헬스 체크
```powershell
# Flask
Invoke-WebRequest http://localhost:5000/api/health

# Spring Boot
Invoke-WebRequest http://localhost:8080/api/health
```

---

## 📋 일반적인 문제

### 문제 1: 포트가 이미 사용 중
**해결:**
```powershell
# 기존 프로세스 종료
.\stop-all.ps1

# 또는 특정 포트 종료
Get-NetTCPConnection -LocalPort 8080 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 문제 2: Maven Wrapper 없음
**해결:**
```powershell
cd backend
# Maven 직접 사용
mvn spring-boot:run
```

### 문제 3: Java 버전 문제
**해결:**
```powershell
# Java 버전 확인 (Java 17 필요)
java -version

# JAVA_HOME 설정 확인
$env:JAVA_HOME
```

### 문제 4: Flask는 실행 중인데 Spring Boot만 실패
**해결:**
- Spring Boot 로그 확인: `backend/spring-boot.log`
- 포트 충돌 확인
- Maven 빌드 오류 확인

---

## 🚀 빠른 시작 체크리스트

- [ ] Flask 실행 중 (포트 5000)
- [ ] Spring Boot 실행 중 (포트 8080)
- [ ] React 실행 중 (포트 5173)
- [ ] 모든 포트 확인 완료

**명령어:**
```powershell
.\start-all.ps1
```

---

## 💡 권장 워크플로우

1. **개발 시작:**
   ```powershell
   .\start-all.ps1
   ```

2. **서비스 확인:**
   - Flask: http://localhost:5000/api/health
   - Spring Boot: http://localhost:8080/api/health
   - Frontend: http://localhost:5173

3. **문제 발생 시:**
   ```powershell
   .\stop-all.ps1
   .\start-all.ps1
   ```

---

**문제가 계속되면:** 각 서비스를 개별 터미널에서 실행하여 로그 확인

