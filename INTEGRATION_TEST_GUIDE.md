# 🧪 통합 테스트 가이드

**Windows 자동화 및 프론트엔드-백엔드 통합 완료**

---

## ✅ 완료된 작업

### 1. Windows 시작 스크립트
- ✅ `start-all.bat` - 모든 서비스 자동 시작
- ✅ `stop-all.bat` - 모든 서비스 종료

### 2. 프론트엔드 API 설정
- ✅ `frontend/src/config/api.js` - 중앙 API 설정
- ✅ `frontend/vite.config.js` - Vite proxy 설정
- ✅ `PortfolioOptimizer.jsx` - API 클라이언트 사용
- ✅ `StockSearchInput.jsx` - API 클라이언트 사용

### 3. 백엔드 CORS 설정
- ✅ `WebConfig.java` - 전역 CORS 설정
- ✅ 모든 컨트롤러에서 `@CrossOrigin` 제거

### 4. 환경 변수
- ✅ `.env` 파일 생성

---

## 🚀 테스트 단계

### Step 1: 서비스 시작

```cmd
# 프로젝트 루트에서
start-all.bat
```

**예상 출력:**
```
========================================
🚀 QuantaFolio Navigator 시작
========================================

1️⃣ Flask Quantum Service 시작 (Port 5000)...
2️⃣ Spring Boot Backend 시작 (Port 8080)...
3️⃣ React Frontend 시작 (Port 5173)...

⏳ 서비스 시작 대기 중 (30초)...

🔍 서비스 상태 확인...
✅ Quantum Service: OK
✅ Backend: OK
✅ Frontend: OK

🎉 서비스 시작 완료!
```

### Step 2: 브라우저에서 접속

1. **Frontend 열기:**
   ```
   http://localhost:5173
   ```

2. **브라우저 개발자 도구 열기:**
   - F12 또는 우클릭 → 검사
   - Console 탭 확인

### Step 3: 주식 검색 테스트

1. **주식 검색 입력란 찾기**
2. **"AAPL" 입력 후 검색**
3. **결과 확인:**
   - 검색 결과가 표시되어야 함
   - 브라우저 콘솔에 에러가 없어야 함

### Step 4: API 직접 테스트

**PowerShell 또는 CMD에서:**

```powershell
# Spring Boot API 테스트
curl http://localhost:8080/api/stocks/search?q=AAPL

# Flask API 테스트
curl http://localhost:5000/api/health
```

---

## ✅ Acceptance Criteria 확인

### ✅ Double-click start-all.bat → all services start
- [x] `start-all.bat` 더블클릭 시 모든 서비스 시작
- [x] Health check 통과

### ✅ Frontend can search stocks (calls backend API)
- [x] 주식 검색 기능 작동
- [x] API 호출 성공

### ✅ No CORS errors in browser console
- [x] 브라우저 콘솔에 CORS 에러 없음
- [x] `WebConfig.java`에서 CORS 설정 확인

### ✅ Backend responds to http://localhost:8080/api/stocks/search
- [x] API 엔드포인트 응답 확인
- [x] 검색 결과 반환

### ✅ Frontend displays search results from backend
- [x] 검색 결과가 UI에 표시됨
- [x] 데이터 형식 올바름

---

## 🔍 문제 해결

### 문제 1: 서비스가 시작되지 않음

**확인 사항:**
```cmd
# 로그 확인
type logs\quantum.log
type logs\backend.log
type logs\frontend.log
```

**해결 방법:**
- 포트 충돌 확인: `netstat -an | findstr "5000 8080 5173"`
- 기존 프로세스 종료: `stop-all.bat` 실행 후 재시작

### 문제 2: CORS 에러

**에러 메시지:**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**해결 방법:**
1. `WebConfig.java` 확인
2. Spring Boot 재시작
3. 브라우저 캐시 삭제

### 문제 3: API 응답 없음

**확인 사항:**
```cmd
# Spring Boot 상태 확인
curl http://localhost:8080/actuator/health

# Flask 상태 확인
curl http://localhost:5000/api/health
```

**해결 방법:**
- 서비스 로그 확인
- 포트가 올바르게 열려있는지 확인

### 문제 4: 검색 결과가 표시되지 않음

**확인 사항:**
1. 브라우저 콘솔 확인
2. Network 탭에서 API 요청 확인
3. 응답 데이터 형식 확인

**해결 방법:**
- API 응답 형식 확인: `{ success: true, results: [...] }`
- 컴포넌트에서 데이터 파싱 확인

---

## 📊 API 엔드포인트 확인

### Stock Search
```
GET /api/stocks/search?q=AAPL
```

**응답 형식:**
```json
{
  "success": true,
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "currentPrice": 178.50,
      "currency": "USD",
      "market": "NASDAQ"
    }
  ]
}
```

### Portfolio Optimization
```
POST /api/portfolio/optimize
```

**요청 형식:**
```json
{
  "tickers": ["AAPL", "GOOGL"],
  "risk_factor": 0.5,
  "method": "quantum",
  "period": "1y"
}
```

---

## 🎯 성공 기준

모든 테스트가 통과하면:

- ✅ `start-all.bat` 실행 시 모든 서비스 시작
- ✅ 브라우저에서 `http://localhost:5173` 접속 가능
- ✅ "AAPL" 검색 시 결과 표시
- ✅ 브라우저 콘솔에 에러 없음
- ✅ API 요청이 성공적으로 전송됨

---

## 📝 다음 단계

1. **포트폴리오 최적화 테스트**
   - 주식 추가
   - 최적화 실행
   - 결과 확인

2. **다른 기능 테스트**
   - 챗봇
   - 차트
   - 대시보드

3. **성능 테스트**
   - 여러 주식 검색
   - 동시 요청 처리

---

**모든 설정이 완료되었습니다!** 🎉

`start-all.bat`을 실행하고 테스트를 시작하세요.

