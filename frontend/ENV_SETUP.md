# Frontend 환경 변수 설정 가이드

## 📋 환경 변수

Frontend는 다음 환경 변수를 사용합니다:

- `VITE_API_URL` - Spring Boot Backend URL (기본값: http://localhost:8080)
- `VITE_PYTHON_BACKEND_URL` - Flask Backend URL (기본값: http://localhost:5000)

## 🚀 설정 방법

### 방법 1: PowerShell 스크립트 사용 (추천)

```powershell
cd C:\Users\user\Project\To-From\frontend
.\setup-env.ps1
```

### 방법 2: 수동 생성

```powershell
cd C:\Users\user\Project\To-From\frontend

@"
VITE_API_URL=http://localhost:8080
VITE_PYTHON_BACKEND_URL=http://localhost:5000
"@ | Out-File -FilePath .env -Encoding UTF8
```

### 방법 3: 텍스트 에디터로 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```
VITE_API_URL=http://localhost:8080
VITE_PYTHON_BACKEND_URL=http://localhost:5000
```

## ✅ 확인

```powershell
# .env 파일 내용 확인
Get-Content .env
```

**예상 출력:**
```
VITE_API_URL=http://localhost:8080
VITE_PYTHON_BACKEND_URL=http://localhost:5000
```

## 🔄 Frontend 재시작

환경 변수 변경 후에는 **반드시 Frontend를 재시작**해야 합니다:

1. 현재 실행 중인 서버 중지: `Ctrl + C`
2. 다시 시작: `npm run dev`

## 📝 사용 위치

환경 변수는 다음 파일에서 사용됩니다:

- `src/config/api.js` - API 엔드포인트 설정
  - `VITE_API_URL` 또는 `VITE_BACKEND_URL` 사용

## ⚠️ 주의사항

1. **Vite 환경 변수 규칙**: 
   - 반드시 `VITE_` 접두사로 시작해야 함
   - 브라우저에서 접근 가능 (보안 주의)

2. **변경 사항 적용**:
   - `.env` 파일 변경 후 반드시 서버 재시작 필요
   - 개발 서버는 시작 시 환경 변수를 읽음

3. **기본값**:
   - 환경 변수가 없으면 기본값 사용
   - `VITE_API_URL`: `http://localhost:8080`
   - `VITE_PYTHON_BACKEND_URL`: `http://localhost:5000`

## 🔧 문제 해결

### 환경 변수가 적용되지 않는 경우

1. `.env` 파일이 `frontend` 폴더 루트에 있는지 확인
2. 파일 이름이 정확히 `.env`인지 확인 (`.env.local`, `.env.development` 아님)
3. Frontend 서버를 완전히 재시작
4. 브라우저 콘솔에서 확인:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```

### 다른 포트 사용 시

프로덕션 환경이나 다른 포트를 사용하는 경우:

```env
VITE_API_URL=http://your-backend-url:8080
VITE_PYTHON_BACKEND_URL=http://your-flask-url:5000
```

