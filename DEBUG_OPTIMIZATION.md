# 최적화 멈춤 문제 디버깅 가이드

## 🔍 문제 증상
"최적화 중..." 상태에서 멈춰있음

## ✅ 확인 사항

### 1. 브라우저 콘솔 확인 (F12 → Console)
다음 로그들이 나타나는지 확인:

```
📤 Sending to API: { tickers: [...], initial_weights: [...] }
📤 API Request: POST /api/portfolio/optimize/with-weights
```

**에러가 있다면:**
- `ECONNREFUSED`: 백엔드 서버가 실행되지 않음
- `ECONNABORTED` 또는 `timeout`: 요청 시간 초과
- `ERR_NETWORK`: 네트워크 연결 문제

### 2. Spring Boot 콘솔 확인
다음 로그들이 나타나는지 확인:

```
📦 Spring Boot Received:
   → tickers: [...] (개수: N)
   → initialWeights: [...] (개수: N)
📤 Sending to Flask:
   → tickers: [...] (개수: N)
   → initial_weights: [...] (개수: N)
```

**에러가 있다면:**
- `Flask 서버 연결 실패`: Flask가 실행되지 않음
- `initialWeights의 개수가 tickers와 일치해야 합니다`: 데이터 검증 실패

### 3. Flask 콘솔 확인 (PowerShell)
다음 로그가 나타나는지 확인:

```
📦 Received: {'tickers': [...], 'initial_weights': [...]}
   → tickers: [...] (개수: N)
   → initial_weights: [...] (개수: N)
```

**에러가 있다면:**
- `initial_weights의 개수는 tickers와 일치해야 합니다`: 데이터 불일치
- `비중의 합이 1.0이어야 합니다`: 가중치 합이 1이 아님

## 🛠️ 해결 방법

### 방법 1: 서비스 상태 확인
```powershell
# 모든 서비스가 실행 중인지 확인
.\check-health.ps1
```

### 방법 2: 서비스 재시작
```powershell
# 모든 서비스 중지
taskkill /F /IM java.exe
taskkill /F /IM python.exe
taskkill /F /IM node.exe

# 잠시 대기
Start-Sleep -Seconds 3

# 모든 서비스 재시작
.\start-all.ps1
```

### 방법 3: 브라우저에서 직접 테스트
브라우저 콘솔에서:

```javascript
// Flask 직접 테스트
fetch('http://localhost:5000/api/optimize/with-weights', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    tickers: ['AAPL', 'GOOGL'],
    initial_weights: [0.5, 0.5],
    risk_factor: 0.5,
    method: 'quantum',
    period: '1y'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 방법 4: 타임아웃 확인
- 현재 타임아웃: **2분 (120초)**
- 양자 최적화는 시간이 오래 걸릴 수 있음
- Flask 콘솔에서 실제 진행 상황 확인

## 📊 예상 동작

### 정상 플로우:
1. 프론트엔드: `📤 Sending to API` 로그
2. Spring Boot: `📦 Spring Boot Received` 로그
3. Spring Boot: `📤 Sending to Flask` 로그
4. Flask: `📦 Received` 로그
5. Flask: 최적화 진행 (시간 소요)
6. Flask: 결과 반환
7. 프론트엔드: 결과 표시

### 문제 발생 시:
- 각 단계에서 로그 확인
- 에러 메시지 확인
- 서비스 상태 확인

## 💡 추가 팁

1. **브라우저 새로고침**: Ctrl + F5 (캐시 무시)
2. **브라우저 콘솔 클리어**: Ctrl + L
3. **네트워크 탭 확인**: F12 → Network → 최적화 요청 확인
4. **Flask 로그 확인**: PowerShell에서 Flask 실행 중인 터미널 확인

