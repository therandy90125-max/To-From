# 📊 프로젝트 비교 분석 보고서

To-From vs Stock-Portfolio-Optimizer 상세 비교

---

## 🎯 Executive Summary

| 항목 | To-From (현재) | Stock-Portfolio-Optimizer (새로운) |
|------|----------------|-----------------------------------|
| **추천도** | ⭐⭐⭐⭐⭐ (프로덕션용) | ⭐⭐⭐⭐ (데모/교육용) |
| **복잡도** | 높음 (4개 서비스) | 낮음 (단일 JAR) |
| **확장성** | 높음 | 중간 |
| **배포** | 복잡함 | 간단함 |
| **데이터 영속성** | ✅ MariaDB | ❌ H2 (세션 기반) |

---

## 📐 1. 아키텍처 비교

### To-From (Multi-Service Architecture)
```
┌─────────────┐
│  React/Vite │ :5173
│  (Frontend) │
└──────┬──────┘
       │ /api/*
       ▼
┌─────────────┐
│ Spring Boot │ :8080  ←──── MariaDB :3306
│  (Gateway)  │                (영구 저장)
└──────┬──────┘
       │ RestTemplate
       ▼
┌─────────────┐
│    Flask    │ :5000
│   (Python)  │ ←──── Qiskit, yfinance
└─────────────┘
```

**장점:**
- ✅ 마이크로서비스 패턴 (확장 용이)
- ✅ Flask 독립 배포 가능
- ✅ 서비스 간 느슨한 결합
- ✅ 프로덕션 환경에 적합
- ✅ 데이터 영구 저장 (MariaDB)
- ✅ 로드 밸런싱 가능

**단점:**
- ⚠️ 4개 서비스 관리 필요 (MariaDB, Flask, Spring Boot, React)
- ⚠️ 배포 복잡도 높음
- ⚠️ 네트워크 레이턴시 (Spring → Flask)
- ⚠️ CORS 설정 필요
- ⚠️ 초기 설정 시간 오래 걸림

---

### Stock-Portfolio-Optimizer (Monolithic Architecture)
```
┌─────────────┐
│  React/Vite │
│   (builds)  │
└──────┬──────┘
       │ npm build
       ▼
┌─────────────┐
│ Spring Boot │ :8080  ←──── H2 :memory
│   (Mono)    │                (세션 저장)
└──────┬──────┘
       │ Apache Commons Exec
       ▼
┌─────────────┐
│   Python    │
│  (Scripts)  │ ←──── Qiskit, yfinance
└─────────────┘
```

**장점:**
- ✅ 단일 JAR 배포 (간단함)
- ✅ Python 실행 경로만 설정
- ✅ CORS 문제 없음
- ✅ 빠른 프로토타입 개발
- ✅ 데모/교육용으로 최적
- ✅ 한 번의 명령으로 실행

**단점:**
- ⚠️ 데이터 휘발성 (재시작 시 초기화)
- ⚠️ 확장성 제한 (모놀리스)
- ⚠️ Python 프로세스 관리 복잡
- ⚠️ 서비스 분리 어려움
- ⚠️ 메모리 사용량 높음

---

## 💾 2. 데이터베이스 비교

### To-From: MariaDB (영구 저장)

**설정:**
```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/toandfrom
    username: root
    password: 0000
  jpa:
    hibernate:
      ddl-auto: update  # 자동 스키마 업데이트
```

**JPA 엔티티:**
- ✅ `PortfolioResult` - 최적화 결과 저장
- ✅ `StockWeight` - 주식 비중 저장 (원본/최적화)
- ✅ 데이터 히스토리 추적 가능
- ✅ 재시작 후에도 데이터 유지
- ✅ 복잡한 쿼리 지원

**사용 예:**
```java
// 자동 저장 (auto_save=true)
portfolioDataService.saveOptimizationResult(...);

// 이전 결과 조회
List<PortfolioResult> history = portfolioResultRepository.findByOrderByCreatedAtDesc();
```

---

### Stock-Portfolio-Optimizer: H2 In-Memory

**설정:**
```properties
spring.datasource.url=jdbc:h2:mem:portfoliodb
spring.h2.console.enabled=true
```

**특징:**
- ⚠️ 메모리에만 저장 (재시작 시 삭제)
- ⚠️ 히스토리 추적 불가
- ⚠️ 프로덕션 사용 부적합
- ✅ 설정 간단 (외부 DB 불필요)
- ✅ 빠른 테스트 가능

---

## 🐍 3. Python 통합 방식 비교

### To-From: Flask REST API

**구조:**
```python
# Flask 서버 (독립 실행)
@app.route('/api/optimize/with-weights', methods=['POST'])
def optimize_with_weights():
    data = request.get_json()
    optimizer = PortfolioOptimizer(...)
    result = optimizer.optimize_with_weights(...)
    return jsonify({'success': True, 'result': result})
```

**Spring Boot에서 호출:**
```java
// RestTemplate으로 HTTP 요청
ResponseEntity<Map> response = restTemplate.postForEntity(
    "http://localhost:5000/api/optimize/with-weights",
    request,
    Map.class
);
```

**장점:**
- ✅ Flask 독립 배포/확장
- ✅ RESTful API (표준)
- ✅ 여러 클라이언트 지원 가능
- ✅ 디버깅 쉬움 (Postman 등)
- ✅ 타임아웃 처리 용이

**단점:**
- ⚠️ Flask 서버 항상 실행 필요
- ⚠️ 네트워크 오버헤드
- ⚠️ 포트 관리 필요

---

### Stock-Portfolio-Optimizer: Direct Script Execution

**구조:**
```java
// Apache Commons Exec로 직접 실행
CommandLine cmdLine = CommandLine.parse("python");
cmdLine.addArgument("optimize_portfolio.py");
cmdLine.addArgument(inputFile);

DefaultExecutor executor = new DefaultExecutor();
int exitCode = executor.execute(cmdLine);

// 표준 출력에서 JSON 파싱
Map result = objectMapper.readValue(output, Map.class);
```

**장점:**
- ✅ Flask 서버 불필요
- ✅ 간단한 배포
- ✅ 리소스 효율적 (필요할 때만 실행)
- ✅ Python 환경만 필요

**단점:**
- ⚠️ 프로세스 생성 오버헤드
- ⚠️ 표준 입출력 버퍼 관리 복잡
- ⚠️ 에러 핸들링 어려움
- ⚠️ 동시 요청 처리 제한적
- ⚠️ Python 경로 설정 필수

---

## 🎨 4. 프론트엔드 비교

### To-From

**개발 모드:**
```bash
cd frontend
npm run dev  # :5173 (Vite dev server)
```

**프로덕션:**
```bash
npm run build
# dist/ 폴더를 별도 웹서버에 배포
```

**컴포넌트:**
- `Dashboard.jsx` - 대시보드
- `PortfolioOptimizerWithWeights.jsx` - 비중 기반 최적화
- `PortfolioOptimizerSimple.jsx` - 간단 최적화
- `Chatbot.jsx` - 챗봇
- `Settings.jsx` - 설정

**API 호출:**
```javascript
// Vite proxy를 통해 Spring Boot로 자동 라우팅
await axios.post('/api/portfolio/optimize/with-weights', {
  tickers: [...],
  initial_weights: [...],
  auto_save: true
});
```

---

### Stock-Portfolio-Optimizer

**개발/프로덕션:**
```bash
cd frontend
npm run build  # → ../src/main/resources/static/
```

**컴포넌트:**
- `Dashboard.jsx` - 향상된 대시보드 (활동 이력)
- `PortfolioOptimizer.jsx` - 단일 최적화 페이지
- `StockSearchInput.jsx` - 재사용 가능한 검색 컴포넌트
- `ExchangeRateWidget.jsx` - 환율 위젯
- `Chatbot.jsx` - 챗봇
- `Settings.jsx` - 설정

**API 호출:**
```javascript
// 같은 서버 (8080)이므로 상대 경로
await axios.post('/api/portfolio/optimize', {
  stocks: [...],
  riskFactor: 5
});
```

**차이점:**
- ✅ `StockSearchInput` - 독립 컴포넌트 (재사용 가능)
- ✅ 실시간 주가 조회 기능
- ✅ 한국/미국 주식 구분
- ✅ 환율 위젯

---

## 🚀 5. 기능 비교

| 기능 | To-From | Stock-Portfolio |
|------|---------|-----------------|
| **포트폴리오 최적화** | ✅ | ✅ |
| **양자 최적화 (QAOA)** | ✅ | ✅ |
| **고전적 최적화** | ✅ | ✅ |
| **비중 기반 최적화** | ✅ | ❌ |
| **자동 저장** | ✅ | ❌ |
| **데이터 영속성** | ✅ (MariaDB) | ❌ (H2 메모리) |
| **한국 주식 지원** | ❌ | ✅ (.KS) |
| **실시간 주가** | ❌ | ✅ (yfinance) |
| **환율 변환** | ❌ | ✅ (USD→KRW) |
| **챗봇** | ✅ | ✅ |
| **다국어** | ✅ | ✅ |
| **히스토리 추적** | ✅ | ❌ |

---

## ⚡ 6. 성능 비교

### To-From

**요청 흐름:**
```
React → Spring Boot → Flask → Python → yfinance
  ↓         ↓           ↓
 50ms     100ms       2000ms (양자 최적화)
                        ↓
                    MariaDB 저장 (50ms)
```

**총 소요 시간:** ~2.2초 (네트워크 오버헤드 포함)

**동시 요청 처리:**
- ✅ Flask는 threaded=True로 여러 요청 동시 처리
- ✅ Spring Boot는 Tomcat 스레드 풀 사용
- ✅ 확장 가능 (Flask 인스턴스 추가)

---

### Stock-Portfolio-Optimizer

**요청 흐름:**
```
React (embedded) → Spring Boot → Python Script → yfinance
                       ↓            ↓
                     50ms        2000ms (양자 최적화)
                                   ↓
                               H2 저장 (10ms)
```

**총 소요 시간:** ~2.1초

**동시 요청 처리:**
- ⚠️ Python 프로세스 순차 실행 (병렬 처리 제한)
- ⚠️ 프로세스 생성 오버헤드
- ⚠️ 확장 어려움

---

## 💰 7. 배포 비용 비교

### To-From (프로덕션 배포)

**필요 리소스:**
- Frontend 서버: Netlify/Vercel (무료) 또는 Nginx
- Spring Boot: AWS EC2 t3.medium (메모리 4GB)
- Flask: AWS EC2 t3.small (메모리 2GB)
- MariaDB: AWS RDS t3.micro (메모리 1GB)

**월 예상 비용:** $50-80
**장점:** 각 서비스 독립 확장 가능

---

### Stock-Portfolio-Optimizer (단일 배포)

**필요 리소스:**
- Spring Boot (Frontend 포함): AWS EC2 t3.medium (메모리 4GB)
- Python 환경: 같은 서버

**월 예상 비용:** $30-40
**장점:** 관리 간단, 비용 절감
**단점:** 확장 제한적

---

## 🎯 8. 사용 사례별 추천

### To-From을 선택해야 할 경우:

✅ **프로덕션 서비스** 운영
✅ **사용자 데이터** 영구 저장 필요
✅ **히스토리 추적** 및 분석 필요
✅ **확장 가능한** 아키텍처 필요
✅ **여러 클라이언트** (모바일 앱 등) 지원
✅ **마이크로서비스** 경험 쌓기
✅ **팀 협업** (프론트/백/ML 분리)

**예시:**
- 실제 투자 자문 서비스
- SaaS 포트폴리오 관리 플랫폼
- 금융 API 서비스

---

### Stock-Portfolio-Optimizer를 선택해야 할 경우:

✅ **데모/프로토타입** 빠르게 개발
✅ **교육용** 프로젝트
✅ **로컬 사용** (개인 도구)
✅ **간단한 배포** 원함
✅ **한국 주식** 지원 필요
✅ **실시간 주가** 조회 필요
✅ **단일 서버** 환경

**예시:**
- 대학 프로젝트
- 기술 데모
- 개인 포트폴리오 관리 도구

---

## 🔄 9. 마이그레이션 전략

### Option A: To-From 유지 + 기능 추가 (추천 ⭐)

**작업:**
1. Stock-Portfolio의 실시간 주가 기능 복사
2. 한국 주식 지원 추가 (.KS)
3. `StockSearchInput` 컴포넌트 복사

**예상 시간:** 2-3시간
**위험도:** 낮음
**이점:** 기존 아키텍처 유지, 기능만 추가

---

### Option B: Stock-Portfolio로 전환 + DB 추가

**작업:**
1. H2를 MariaDB로 교체
2. 데이터 영속성 레이어 추가
3. 기존 To-From의 자동 저장 기능 이식

**예상 시간:** 5-6시간
**위험도:** 중간
**이점:** 간단한 배포 + 데이터 영속성

---

### Option C: 하이브리드 (최적)

**To-From을 메인으로 유지하고:**
1. 실시간 주가 조회 추가
2. 한국 주식 지원 추가
3. `StockSearchInput` UI 개선
4. 환율 위젯 추가

**Stock-Portfolio는:**
- 데모/교육용으로 별도 유지
- 빠른 테스트용

**예상 시간:** 3-4시간
**위험도:** 낮음
**이점:** 양쪽 장점 활용

---

## 📊 10. 최종 추천

### 🏆 **추천: Option A (To-From 유지 + 기능 추가)**

**이유:**
1. ✅ 현재 To-From은 **프로덕션 수준** 아키텍처
2. ✅ MariaDB **데이터 영속성** 이미 구현됨
3. ✅ 자동 저장, JPA 엔티티 이미 완성
4. ✅ 마이크로서비스 패턴으로 **확장 용이**
5. ✅ 실시간 주가/한국 주식은 **쉽게 추가** 가능

**추가할 기능:**
- [ ] Flask에 yfinance 실시간 주가 조회
- [ ] 한국 주식 심볼 지원 (.KS, .KQ)
- [ ] USD→KRW 환율 변환
- [ ] `StockSearchInput` UI 컴포넌트
- [ ] 거래소 배지 (KOSPI, NASDAQ)

**예상 작업:**
```
1. Flask backend 업데이트 (1시간)
   - yfinance 실시간 조회
   - 한국 주식 지원
   
2. Frontend 컴포넌트 복사 (1시간)
   - StockSearchInput.jsx
   - 검색 UI 개선
   
3. 테스트 및 통합 (1시간)
   - 한국/미국 주식 테스트
   - 실시간 가격 확인
```

**총 예상 시간:** 3시간

---

## 📝 11. 구체적 추천 작업

### Phase 1: 실시간 주가 조회 추가 (1시간)

```python
# To-From/python-backend/stock_data.py (새 파일)
import yfinance as yf

def fetch_real_time_price(symbol: str):
    """실시간 주가 조회"""
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.info
        return {
            'symbol': symbol,
            'currentPrice': data.get('currentPrice'),
            'change': data.get('regularMarketChange'),
            'changePercent': data.get('regularMarketChangePercent'),
            'volume': data.get('volume'),
            'dataSource': 'yfinance'
        }
    except:
        return {'error': 'Failed to fetch data'}
```

### Phase 2: 한국 주식 지원 (30분)

```python
# 심볼 변환 함수
def normalize_korean_symbol(symbol: str) -> str:
    """한국 주식 심볼 정규화"""
    if symbol.isdigit():
        return f"{symbol}.KS"  # KOSPI
    return symbol
```

### Phase 3: UI 컴포넌트 업데이트 (1.5시간)

```javascript
// StockSearchInput.jsx 통합
// 거래소 배지 추가
// 실시간 가격 표시
```

---

## 🎬 12. 결론

### ✅ **최종 결정: To-From 프로젝트 유지**

**근거:**
1. **아키텍처 우수성** - 프로덕션 수준의 멀티 티어
2. **데이터 영속성** - 이미 구현된 MariaDB + JPA
3. **확장성** - 마이크로서비스 패턴
4. **완성도** - 자동 저장, 히스토리 추적 등 고급 기능
5. **비용 효율** - 이미 완성된 기능 재사용

**추가 작업:**
- Stock-Portfolio의 **실시간 주가** 기능만 이식
- **한국 주식** 지원 추가
- **UI 컴포넌트** 개선

**Stock-Portfolio 활용:**
- **참고 자료**로 활용
- **데모/교육용**으로 별도 유지
- **빠른 테스트**용

---

## 📋 13. 다음 단계

### 승인 후 진행할 작업:

1. ✅ **승인 받기** - 사용자 확인
2. 🔨 **Phase 1** - 실시간 주가 Flask에 추가
3. 🔨 **Phase 2** - 한국 주식 지원
4. 🔨 **Phase 3** - UI 컴포넌트 업데이트
5. ✅ **테스트** - 통합 테스트
6. 🚀 **배포** - Git push

**예상 완료 시간:** 3-4시간

---

## ❓ 의사결정 질문

사용자님께 다음을 확인합니다:

1. **To-From 유지 + 기능 추가**에 동의하시나요?
2. 아니면 **Stock-Portfolio로 완전 전환**하시겠습니까?
3. 또는 **하이브리드 접근**을 원하시나요?

승인해주시면 바로 작업 시작하겠습니다! 🚀

