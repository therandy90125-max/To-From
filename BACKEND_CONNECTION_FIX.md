# 백엔드 연결 문제 해결 가이드

## 🔍 문제 진단

PowerShell에서 모든 서비스가 성공했다고 나오지만 웹 페이지에서 연결이 안 되는 경우:

### 1. CORS 문제 확인

**Spring Boot CORS 설정 확인:**
- 파일: `backend/src/main/java/.../config/WebConfig.java`
- 확인 사항:
  ```java
  .allowedOrigins("http://localhost:5173")
  .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
  .allowedHeaders("*")
  ```

### 2. 프론트엔드 API URL 확인

**파일:** `frontend/src/config/api.js`

```javascript
const BACKEND_URL = import.meta.env.VITE_API_URL || 
                    import.meta.env.VITE_BACKEND_URL || 
                    'http://localhost:8080';
```

**확인 방법:**
1. 브라우저 개발자 도구 (F12)
2. Console 탭에서 확인:
   ```
   🔗 Backend URL: http://localhost:8080
   ```

### 3. 실제 연결 테스트

**브라우저 콘솔에서:**
```javascript
// 직접 테스트
fetch('http://localhost:8080/actuator/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**예상 결과:**
```json
{
  "status": "UP"
}
```

### 4. 네트워크 탭 확인

1. 브라우저 개발자 도구 → Network 탭
2. 페이지 새로고침
3. `/api/stocks/search` 또는 `/actuator/health` 요청 확인
4. 상태 코드 확인:
   - 200: 성공
   - 404: 엔드포인트 없음
   - 500: 서버 에러
   - CORS error: CORS 설정 문제

## 🛠️ 해결 방법

### 방법 1: CORS 재설정

**Spring Boot WebConfig 확인:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
```

### 방법 2: 프론트엔드 환경 변수 확인

**파일:** `frontend/.env`
```
VITE_API_URL=http://localhost:8080
VITE_BACKEND_URL=http://localhost:8080
```

**확인:**
```powershell
cd frontend
Get-Content .env
```

### 방법 3: 백엔드 재시작

```powershell
# 1. 백엔드 중지
taskkill /F /IM java.exe

# 2. 백엔드 재시작
cd backend
.\mvnw.cmd spring-boot:run
```

### 방법 4: 브라우저 캐시 클리어

1. Ctrl + Shift + Delete
2. 캐시된 이미지 및 파일 선택
3. 삭제
4. 페이지 새로고침 (Ctrl + F5)

## 🔍 체크리스트

- [ ] Spring Boot가 실행 중 (포트 8080)
- [ ] Flask가 실행 중 (포트 5000)
- [ ] Frontend가 실행 중 (포트 5173)
- [ ] `http://localhost:8080/actuator/health` 브라우저에서 접속 가능
- [ ] 브라우저 콘솔에 CORS 에러 없음
- [ ] Network 탭에서 요청이 200 응답
- [ ] 프론트엔드 `.env` 파일에 올바른 URL 설정

## 💡 빠른 테스트

**브라우저 콘솔에서 실행:**
```javascript
// 1. 백엔드 연결 테스트
fetch('http://localhost:8080/actuator/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend:', data))
  .catch(err => console.error('❌ Backend Error:', err));

// 2. Flask 연결 테스트
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Flask:', data))
  .catch(err => console.error('❌ Flask Error:', err));

// 3. 주식 검색 테스트
fetch('http://localhost:8080/api/stocks/search?q=AAPL')
  .then(r => r.json())
  .then(data => console.log('✅ Stock Search:', data))
  .catch(err => console.error('❌ Stock Search Error:', err));
```

## 🚨 자주 발생하는 문제

### 문제 1: CORS 에러
**증상:** 브라우저 콘솔에 "CORS policy" 에러

**해결:**
1. WebConfig.java 확인
2. `allowedOrigins`에 `http://localhost:5173` 포함 확인
3. 백엔드 재시작

### 문제 2: 404 Not Found
**증상:** Network 탭에서 404 응답

**해결:**
1. 엔드포인트 URL 확인
2. Spring Boot 컨트롤러 경로 확인
3. `@RequestMapping` 경로 확인

### 문제 3: Connection Refused
**증상:** "Failed to fetch" 또는 "Connection refused"

**해결:**
1. 백엔드가 실제로 실행 중인지 확인
2. 포트 8080이 사용 중인지 확인
3. 방화벽 확인

