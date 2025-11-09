# 브라우저에서 백엔드 연결 테스트

## 🔍 문제 진단

PowerShell 테스트에서는 모든 서비스가 정상이지만, 브라우저에서 "백엔드 연결 안됨"이 표시되는 경우:

## ✅ 테스트 결과 (PowerShell)

- ✅ Spring Boot: HEALTHY (포트 8080)
- ✅ Flask: HEALTHY (포트 5000)
- ✅ Frontend: RUNNING (포트 5173)
- ✅ API 엔드포인트: WORKING
- ✅ CORS 설정: OK (포트 5173/5174 포함)

## 🌐 브라우저에서 직접 테스트

### 1. 브라우저 개발자 도구 열기
- **F12** 또는 **Ctrl + Shift + I**
- **Console** 탭 선택

### 2. 백엔드 연결 테스트

다음 코드를 브라우저 콘솔에 붙여넣고 실행:

```javascript
// 테스트 1: Spring Boot Health Check
fetch('http://localhost:8080/actuator/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Spring Boot:', data);
    return true;
  })
  .catch(err => {
    console.error('❌ Spring Boot Error:', err);
    return false;
  });

// 테스트 2: Flask Health Check
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Flask:', data);
    return true;
  })
  .catch(err => {
    console.error('❌ Flask Error:', err);
    return false;
  });

// 테스트 3: Stock Search API
fetch('http://localhost:8080/api/stocks/search?q=AAPL')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Stock Search:', data);
    return true;
  })
  .catch(err => {
    console.error('❌ Stock Search Error:', err);
    return false;
  });
```

### 3. Network 탭 확인

1. **Network** 탭 열기
2. 페이지 새로고침 (F5)
3. 다음 요청 확인:
   - `/actuator/health`
   - `/api/stocks/search`
4. 각 요청의 **Status Code** 확인:
   - **200**: 성공
   - **404**: 엔드포인트 없음
   - **CORS error**: CORS 문제

## 🐛 가능한 문제

### 문제 1: CORS 에러
**증상:** 콘솔에 "CORS policy" 에러

**해결:**
1. Spring Boot 재시작 (CORS 설정 변경 후)
2. 브라우저 캐시 클리어 (Ctrl + Shift + Delete)

### 문제 2: Mixed Content
**증상:** HTTPS 페이지에서 HTTP API 호출

**해결:** 
- 로컬 개발 환경에서는 문제 없음
- 프로덕션에서는 HTTPS 사용

### 문제 3: 브라우저 캐시
**증상:** 이전 설정이 캐시됨

**해결:**
1. **Ctrl + Shift + Delete** → 캐시 삭제
2. **Ctrl + F5** → 강제 새로고침

## 🔧 해결 방법

### 방법 1: Spring Boot 재시작

CORS 설정을 변경했으므로 Spring Boot를 재시작해야 합니다:

```powershell
# 1. Spring Boot 중지
taskkill /F /IM java.exe

# 2. 잠시 대기
Start-Sleep -Seconds 3

# 3. Spring Boot 재시작
cd backend
.\mvnw.cmd spring-boot:run
```

### 방법 2: 브라우저 캐시 클리어

1. **Ctrl + Shift + Delete**
2. "캐시된 이미지 및 파일" 선택
3. 삭제
4. 페이지 새로고침 (Ctrl + F5)

### 방법 3: 프론트엔드 재시작

```powershell
# Frontend 중지 (Ctrl + C)
# 그 다음 재시작
cd frontend
npm run dev
```

## 📝 체크리스트

브라우저 콘솔에서 다음을 확인:

- [ ] `fetch('http://localhost:8080/actuator/health')` 성공
- [ ] Network 탭에서 요청이 200 응답
- [ ] CORS 에러 없음
- [ ] 프론트엔드가 올바른 포트에서 실행 중 (5173 또는 5174)

## 💡 빠른 해결

```powershell
# 1. 모든 서비스 중지
.\stop-all.bat

# 2. 잠시 대기
Start-Sleep -Seconds 5

# 3. 모든 서비스 재시작
.\start-all.ps1

# 4. 브라우저에서:
#    - Ctrl + Shift + Delete (캐시 삭제)
#    - Ctrl + F5 (강제 새로고침)
#    - F12 (개발자 도구) → Console에서 테스트
```

