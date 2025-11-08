# 🔧 프론트엔드-백엔드 연동 수정 완료

## ✅ 해결된 문제

### 1. 프론트엔드 실행 편의성 개선

**문제:** 매번 `cd frontend`로 이동해야 함

**해결:**
- `run-frontend.ps1` (Windows PowerShell)
- `run-frontend.sh` (Linux/Mac/Git Bash)

**사용법:**
```powershell
# 프로젝트 루트에서
.\run-frontend.ps1
```

```bash
# 프로젝트 루트에서
./run-frontend.sh
```

### 2. 백엔드 API 경로 호환성 개선

**문제:** 프론트엔드가 `/api/portfolio/*` 경로를 호출하는데 Flask에는 `/api/optimize`만 있음

**해결:** Flask에 Spring Boot 호환 경로 추가

#### 추가된 Flask 엔드포인트:

1. **포트폴리오 최적화**
   - `/api/optimize` (기존)
   - `/api/portfolio/optimize` (새로 추가) ✅

2. **가중치 기반 최적화**
   - `/api/optimize/with-weights` (기존)
   - `/api/portfolio/optimize/with-weights` (새로 추가) ✅

3. **주가 조회**
   - `/api/stock/price/<symbol>` (기존)
   - `/api/portfolio/stock/price/<symbol>` (새로 추가) ✅

4. **주식 검색**
   - `/api/stocks/search` (기존)
   - `/api/portfolio/stock/search` (새로 추가) ✅

## 📋 프론트엔드가 호출하는 엔드포인트

| 프론트엔드 경로 | Spring Boot | Flask (기존) | Flask (추가) |
|----------------|-------------|--------------|--------------|
| `/api/portfolio/optimize` | ✅ | ❌ | ✅ |
| `/api/portfolio/optimize/with-weights` | ✅ | ✅ | ✅ |
| `/api/portfolio/stock/price/:symbol` | ✅ | ❌ | ✅ |
| `/api/portfolio/stock/search` | ✅ | ❌ | ✅ |
| `/api/chatbot/chat` | ✅ | ✅ | - |

## 🚀 사용 방법

### 방법 1: 루트에서 실행 (권장)

```powershell
# Windows
.\run-frontend.ps1

# Linux/Mac
./run-frontend.sh
```

### 방법 2: 기존 방법

```bash
cd frontend
npm run dev
```

### 방법 3: 모든 서비스 동시 실행

```powershell
# Docker 사용
.\start.sh

# 또는 개발 모드
.\start-dev.ps1
```

## ✅ 테스트

1. **프론트엔드 시작:**
   ```powershell
   .\run-frontend.ps1
   ```

2. **백엔드 확인:**
   - Spring Boot: http://localhost:8080/actuator/health
   - Flask: http://localhost:5000/api/health

3. **프론트엔드 접속:**
   - http://localhost:5173

4. **API 호출 테스트:**
   - 브라우저 콘솔에서 네트워크 요청 확인
   - Spring Boot 실패 시 Flask로 자동 fallback 확인

## 🔍 문제 해결

### 백엔드 연결 실패 시

1. **Spring Boot 확인:**
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

2. **Flask 확인:**
   ```powershell
   cd python-backend
   python app.py
   ```

3. **포트 확인:**
   ```powershell
   netstat -an | findstr "5000 8080 5173"
   ```

### 프론트엔드 실행 오류

1. **node_modules 확인:**
   ```powershell
   cd frontend
   npm install
   ```

2. **권한 확인:**
   ```bash
   chmod +x run-frontend.sh
   ```

---

**모든 수정 완료!** 이제 프론트엔드를 루트에서 실행할 수 있고, 백엔드 연동도 정상 작동합니다. 🎉

