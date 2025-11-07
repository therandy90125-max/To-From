# ToAndFrom 아키텍처 문서

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    React/Vite Frontend                      │
│                      (Port 5173)                            │
│  - TNF Dashboard UI                                         │
│  - 다국어 지원 (한국어/영어)                                │
│  - Tailwind CSS + Recharts                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Axios HTTP Requests
                        │ /api/*
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Spring Boot Backend                        │
│                      (Port 8080)                            │
│  - REST API Gateway                                          │
│  - CORS 처리                                                 │
│  - 요청 라우팅 및 검증                                       │
│  - MariaDB 연결 (데이터 저장)                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ RestTemplate HTTP
                        │ Flask API 호출
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Flask Python Backend                       │
│                      (Port 5000)                            │
│  - Qiskit 양자 최적화                                        │
│  - Yahoo Finance 데이터 수집                                 │
│  - 포트폴리오 최적화 로직                                    │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ (데이터 저장)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       MariaDB Database                       │
│                      (Port 3306)                            │
│  - 포트폴리오 데이터 저장                                    │
│  - 사용자 정보 (향후)                                        │
└─────────────────────────────────────────────────────────────┘
```

## 데이터 흐름

### 1. 포트폴리오 최적화 요청

```
User Input (Frontend)
    ↓
React Component (PortfolioOptimizerWithWeights)
    ↓
Axios POST /api/portfolio/optimize/with-weights
    ↓
Vite Proxy → http://localhost:8080
    ↓
Spring Boot PortfolioController
    ↓
PortfolioOptimizationService
    ↓
RestTemplate → http://localhost:5000/api/optimize/with-weights
    ↓
Flask app.py → /api/optimize/with-weights
    ↓
optimizer.py → optimize_with_weights()
    ↓
Qiskit QAOA / NumPy 최적화
    ↓
Yahoo Finance 데이터 수집
    ↓
결과 반환 (Flask → Spring Boot → Frontend)
```

### 2. 데이터 저장 (향후 구현)

```
Optimization Result
    ↓
Spring Boot PortfolioController
    ↓
PortfolioService (JPA Repository)
    ↓
MySQL Database
```

## API 엔드포인트

### Spring Boot (Port 8080)

- `GET /api/test` - 서버 상태 확인
- `GET /api/health` - 헬스 체크
- `POST /api/portfolio/optimize` - 포트폴리오 최적화 (Spring Boot → Flask)
- `POST /api/portfolio/optimize/with-weights` - 기존 비중 기반 최적화
- `GET /api/portfolio/health/flask` - Flask 서버 상태 확인

### Flask (Port 5000)

- `GET /api/health` - 서버 상태 확인
- `POST /api/optimize` - 기본 포트폴리오 최적화
- `POST /api/optimize/with-weights` - 기존 비중 기반 최적화
- `POST /api/optimize/batch` - 배치 최적화

## 기술 스택

### Frontend
- **React 18.2.0** - UI 프레임워크
- **Vite 5.0.0** - 빌드 도구 및 개발 서버
- **Axios 1.6.0** - HTTP 클라이언트
- **Tailwind CSS 3.4.0** - 유틸리티 CSS
- **Recharts 2.10.0** - 차트 라이브러리

### Backend (Spring Boot)
- **Spring Boot 3.2.3** - Java 웹 프레임워크
- **Spring Web** - REST API
- **Spring Data JPA** - 데이터베이스 ORM
- **MariaDB Connector** - MariaDB 연결
- **RestTemplate** - Flask API 호출

### Backend (Flask)
- **Flask 3.0.0** - Python 웹 프레임워크
- **Qiskit 0.45.0+** - 양자 컴퓨팅 프레임워크
- **yfinance 0.2.28+** - 주식 데이터 수집
- **NumPy, Pandas** - 데이터 처리

### Database
- **MariaDB 10.5+** - 관계형 데이터베이스

## 환경 설정

### Frontend (Vite)
```javascript
// vite.config.js
proxy: {
  "/api": "http://127.0.0.1:8080"  // Spring Boot
}
```

### Spring Boot
```yaml
# application.yml
flask:
  api:
    url: http://localhost:5000
```

### Flask
```python
# app.py
CORS(app)  # 모든 origin 허용 (개발 환경)
```

## 실행 순서

1. **MariaDB 시작** (포트 3306)
2. **Flask 백엔드 시작** (포트 5000)
   ```bash
   cd python-backend
   python app.py
   ```
3. **Spring Boot 시작** (포트 8080)
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. **React 프론트엔드 시작** (포트 5173)
   ```bash
   cd frontend
   npm run dev
   ```

## 보안 고려사항

- CORS는 현재 개발 환경에서 모든 origin을 허용
- 프로덕션 환경에서는 특정 origin만 허용하도록 설정 필요
- API 키 및 민감한 정보는 환경 변수로 관리 필요

