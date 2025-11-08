# 백엔드 연결 문제 빠른 해결 가이드

## ✅ 현재 상태 확인

- ✅ 백엔드 서버: 실행 중 (http://localhost:8080)
- ✅ .env 파일: 올바르게 설정됨
- ⚠️ 프론트엔드 재시작 필요할 수 있음

## 🚀 즉시 해결 방법

### 1단계: 프론트엔드 재시작 (가장 중요!)

```powershell
# 프론트엔드 폴더로 이동
cd C:\Users\user\Project\To-From\frontend

# 현재 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

**또는 Cursor Tasks 사용:**
1. `Ctrl + Shift + P`
2. `Tasks: Run Task`
3. `Frontend (React + Vite)` 선택

### 2단계: 브라우저 새로고침

- **하드 리프레시**: `Ctrl + Shift + R` (또는 `Ctrl + F5`)
- 또는 브라우저 캐시 삭제 후 새로고침

### 3단계: 브라우저 콘솔 확인

1. `F12`로 개발자 도구 열기
2. **Console** 탭 확인
3. 다음 메시지가 보여야 함:
   ```
   🔗 Backend URL: http://localhost:8080
   ```

### 4단계: 환경 변수 확인

브라우저 콘솔에서 실행:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

**예상 결과:** `http://localhost:8080`

## 🔍 문제가 계속되면

### Network 탭 확인

1. `F12` → **Network** 탭
2. 페이지 새로고침
3. `/api/`로 시작하는 요청 확인
4. 상태 코드 확인:
   - ✅ `200 OK` → 정상
   - ❌ `CORS error` → CORS 문제
   - ❌ `Failed to fetch` → 백엔드 연결 실패

### 백엔드 로그 확인

Backend 터미널에서 다음을 확인:
- API 요청이 들어오는지
- 에러 메시지가 있는지

## 📋 체크리스트

- [ ] 백엔드 서버 실행 중 (`http://localhost:8080`)
- [ ] `.env` 파일이 `frontend` 폴더에 있음
- [ ] `.env` 파일에 `VITE_API_URL=http://localhost:8080` 있음
- [ ] 프론트엔드 서버를 **재시작**함
- [ ] 브라우저를 **하드 리프레시**함 (`Ctrl + Shift + R`)
- [ ] 브라우저 콘솔에 `🔗 Backend URL: http://localhost:8080` 메시지 있음

## 💡 추가 팁

### 모든 서비스 재시작

```powershell
cd C:\Users\user\Project\To-From

# 모든 서비스 중지
.\stop-all.bat

# 잠시 대기
Start-Sleep -Seconds 3

# 모든 서비스 시작
.\start-all.bat
```

### 환경 변수 강제 재설정

```powershell
cd C:\Users\user\Project\To-From\frontend

# .env 파일 삭제 후 재생성
Remove-Item .env -ErrorAction SilentlyContinue
@"
VITE_API_URL=http://localhost:8080
VITE_PYTHON_BACKEND_URL=http://localhost:5000
"@ | Out-File -FilePath .env -Encoding UTF8

# 프론트엔드 재시작
npm run dev
```

## 🆘 여전히 안 되면

1. **브라우저 콘솔의 전체 에러 메시지** 복사
2. **Network 탭의 실패한 요청** 스크린샷
3. **백엔드 터미널의 로그** 확인

이 정보를 가지고 문제를 더 정확히 진단할 수 있습니다.

