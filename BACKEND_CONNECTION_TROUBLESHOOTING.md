# 백엔드 연결 문제 해결 가이드

## 🔍 빠른 진단

```powershell
cd C:\Users\user\Project\To-From
.\fix-backend-connection.ps1
```

## ✅ 확인 사항

### 1. 백엔드 서버가 실행 중인가?

```powershell
# 헬스체크
curl http://localhost:8080/actuator/health

# 또는
Invoke-RestMethod -Uri "http://localhost:8080/actuator/health"
```

**예상 응답:**
```json
{
  "status": "UP"
}
```

**문제:** 백엔드가 실행되지 않음
**해결:** 
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### 2. 프론트엔드 .env 파일 확인

```powershell
cd frontend
Get-Content .env
```

**필요한 내용:**
```
VITE_API_URL=http://localhost:8080
VITE_PYTHON_BACKEND_URL=http://localhost:5000
```

**문제:** .env 파일이 없거나 잘못됨
**해결:**
```powershell
cd frontend
.\setup-env.ps1
```

### 3. 프론트엔드 재시작

**중요:** .env 파일을 변경한 후에는 **반드시** 프론트엔드를 재시작해야 합니다!

1. 현재 서버 중지: `Ctrl + C`
2. 다시 시작: `npm run dev`

### 4. 브라우저 콘솔 확인

1. `F12`로 개발자 도구 열기
2. **Console** 탭에서 에러 메시지 확인
3. **Network** 탭에서 API 요청 상태 확인

**확인할 메시지:**
```
🔗 Backend URL: http://localhost:8080
```

**에러 메시지 예시:**
- `❌ No response from server. Backend not running?` → 백엔드 서버가 실행되지 않음
- `CORS policy` → CORS 설정 문제
- `Failed to fetch` → 네트워크 연결 문제

### 5. 환경 변수 확인

브라우저 콘솔에서 실행:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

**예상 값:** `http://localhost:8080`

## 🔧 일반적인 문제 해결

### 문제 1: "Backend Disconnected" 표시

**원인:**
- 백엔드 서버가 실행되지 않음
- 프론트엔드가 재시작되지 않음
- 환경 변수가 잘못 설정됨

**해결:**
1. 백엔드 서버 시작 확인
2. 프론트엔드 재시작
3. 브라우저 새로고침 (Ctrl + F5)

### 문제 2: CORS 에러

**에러 메시지:**
```
Access to fetch at 'http://localhost:8080/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**해결:**
- `WebConfig.java`에서 CORS 설정 확인
- 백엔드 서버 재시작

### 문제 3: 404 Not Found

**원인:** API 엔드포인트 경로가 잘못됨

**해결:**
- `src/config/api.js`에서 엔드포인트 확인
- 백엔드 컨트롤러 경로 확인

### 문제 4: 타임아웃

**에러 메시지:**
```
timeout of 30000ms exceeded
```

**해결:**
- 백엔드 서버가 느리게 응답하는 경우
- `api.js`에서 timeout 값 증가

## 📝 체크리스트

- [ ] 백엔드 서버 실행 중 (`http://localhost:8080`)
- [ ] Flask 서버 실행 중 (`http://localhost:5000`)
- [ ] 프론트엔드 서버 실행 중 (`http://localhost:5173`)
- [ ] `.env` 파일이 `frontend` 폴더에 있음
- [ ] `.env` 파일에 `VITE_API_URL=http://localhost:8080` 설정됨
- [ ] 프론트엔드 서버가 `.env` 변경 후 재시작됨
- [ ] 브라우저 콘솔에 에러 없음
- [ ] Network 탭에서 API 요청이 성공함 (200 OK)

## 🚀 빠른 재시작

모든 서비스를 재시작하려면:

```powershell
# 1. 모든 서비스 중지
.\stop-all.bat

# 2. 모든 서비스 시작
.\start-all.bat

# 또는 Cursor Tasks 사용
# Ctrl + Shift + P → Tasks: Run Task → Start All Services
```

## 📞 추가 도움

문제가 계속되면:
1. 브라우저 콘솔의 전체 에러 메시지 확인
2. 백엔드 터미널의 로그 확인
3. `check-health.ps1` 실행하여 모든 서비스 상태 확인

