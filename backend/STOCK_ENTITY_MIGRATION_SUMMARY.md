# 📋 Stock 엔티티 마이그레이션 요약

## ✅ 완료된 작업

### 1. 엔티티 변경
- **이전**: `CachedStock` (테이블: `stock_cache`)
- **현재**: `Stock` (테이블: `stock_master`)
- **파일 위치**: `com.toandfrom.toandfrom.entity.Stock`

### 2. 추가된 필드
```java
@Entity
@Table(name = "stock_master")
public class Stock {
    @Id
    private String id;  // kr_005930 또는 us_aapl
    
    @Column(unique = true)
    private String symbol;
    
    private String name;
    private String nameKo;  // 한국 주식만
    private String market;  // KOSPI, KOSDAQ, US
    private String type;    // STOCK, ETF, FUND
    
    // 🆕 실시간 동기화를 위한 필드
    private Boolean isActive;  // true: 정상 거래, false: 상장폐지
    private LocalDateTime listedDate;  // 상장일
    private LocalDateTime delistedDate;  // 상장폐지일 (null이면 정상)
    private LocalDateTime lastVerified;  // 마지막 검증 시각
    private String source;  // KRX, SEC, ALPHA_VANTAGE, YFINANCE, NAVER
    
    @Version  // 낙관적 잠금 (동시 업데이트 방지)
    private Long version;
    
    // 기타 필드
    private String sector;
    private String exchange;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 3. Repository 변경
- **이전**: `StockCacheRepository`
- **현재**: `StockRepository`
- **파일 위치**: `com.toandfrom.toandfrom.repository.StockRepository`

### 4. 업데이트된 서비스
- ✅ `StockCacheService` - 메모리 캐시 관리
- ✅ `RealTimeStockService` - 하이브리드 검색 (캐시 우선, API 폴백)
- ✅ `StockSyncScheduler` - 자동 동기화 스케줄러
- ✅ `StockSearchService` - 주식 검색 서비스

### 5. 업데이트된 클라이언트
- ✅ `KRXClient` - 한국거래소 API 클라이언트
- ✅ `SECClient` - SEC Edgar API 클라이언트
- ✅ `YFinanceClient` - yfinance API 클라이언트
- ✅ `AlphaVantageClient` - Alpha Vantage API 클라이언트

### 6. 업데이트된 DTO
- ✅ `SearchResult` - 검색 결과 DTO
- ✅ `KRXResponse` - KRX API 응답 DTO

---

## 🔑 API Key 설정 가이드

### 1. Alpha Vantage API Key (필수)

**용도**: 미국 주식/ETF 검색

**설정 방법**:

#### 방법 1: 환경변수 (권장)
```bash
# Windows (PowerShell)
$env:ALPHAVANTAGE_API_KEY="your_api_key_here"

# Windows (CMD)
set ALPHAVANTAGE_API_KEY=your_api_key_here

# Linux/Mac
export ALPHAVANTAGE_API_KEY=your_api_key_here
```

#### 방법 2: application.properties
```properties
# To-From/backend/src/main/resources/application.properties
alphavantage.api.key=your_api_key_here
```

**API Key 발급**:
- 웹사이트: https://www.alphavantage.co/support/#api-key
- 무료 플랜: 5 API calls/min, 500 calls/day
- 유료 플랜: 더 높은 제한

**현재 설정 위치**:
- `application.properties`: `alphavantage.api.key=${ALPHAVANTAGE_API_KEY:}`
- `AlphaVantageClient.java`: `@Value("${alphavantage.api.key:}")`

---

### 2. KRX Open API Key (선택사항)

**용도**: 한국 주식 상장 종목 목록 조회

**설정 방법**:

#### 방법 1: application.properties
```properties
# To-From/backend/src/main/resources/application.properties
krx.api.key=your_krx_api_key_here
```

**API Key 발급**:
- 웹사이트: http://openapigw.krx.co.kr/
- 회원가입 후 API 키 발급 필요

**폴백 메커니즘**:
- API Key가 없거나 호출 실패 시 → Flask API (네이버 금융 크롤러) 사용
- `KRXClient.java`에서 자동 처리

**현재 설정 위치**:
- `application.properties`: `krx.api.key=your_krx_api_key_here` (주석 처리됨)
- `KRXClient.java`: `@Value("${krx.api.key:}")`

---

### 3. SEC Edgar API (API Key 불필요)

**용도**: 미국 상장 회사 목록 조회

**설정**:
- API Key 불필요
- User-Agent 헤더만 필요 (자동 설정됨)
- `SECClient.java`에서 자동 처리

**현재 설정**:
```java
// SECClient.java
headers.set("User-Agent", "ToAndFrom Portfolio Optimizer (contact@example.com)");
```

**권장사항**: 실제 연락처 이메일로 변경
```java
headers.set("User-Agent", "ToAndFrom Portfolio Optimizer (your-email@example.com)");
```

---

## 📝 application.properties 설정 예시

```properties
# ===============================
# Alpha Vantage API Configuration
# ===============================
# 필수: 미국 주식 검색을 위해 필요
alphavantage.api.key=${ALPHAVANTAGE_API_KEY:your_key_here}

# ===============================
# KRX Open API Configuration
# ===============================
# 선택사항: 없으면 Flask API (네이버 크롤러) 사용
krx.api.key=your_krx_api_key_here

# ===============================
# Flask API Configuration
# ===============================
flask.api.url=http://localhost:5000
```

---

## 🚀 동작 흐름

### 한국 주식 검색
```
1. StockCacheService.searchFromCache() - 메모리 캐시 검색
   ↓ (캐시 미스)
2. KRXClient.getListedStocks()
   ├─ KRX Open API 시도 (krx.api.key 있으면)
   └─ Flask API 폴백 (네이버 크롤러)
3. 결과를 Stock 엔티티로 변환하여 DB 저장
```

### 미국 주식 검색
```
1. StockCacheService.searchFromCache() - 메모리 캐시 검색
   ↓ (캐시 미스)
2. RealTimeStockService.fetchFromApis()
   ├─ AlphaVantageClient.searchSymbol() (alphavantage.api.key 필요)
   └─ YFinanceClient.search() (Flask API)
3. 결과를 Stock 엔티티로 변환하여 DB 저장
```

---

## ⚠️ 중요 사항

### 1. Alpha Vantage API Key는 필수
- 미국 주식 검색에 필수
- API Key 없으면 미국 주식 검색 실패
- 무료 플랜: 5 calls/min, 500 calls/day 제한

### 2. KRX API Key는 선택사항
- 없어도 Flask API (네이버 크롤러)로 동작
- 있으면 더 정확한 공식 데이터 사용 가능

### 3. 데이터 소스 추적
- `Stock.source` 필드로 데이터 출처 기록
- 가능한 값: `KRX`, `SEC`, `ALPHA_VANTAGE`, `YFINANCE`, `NAVER`

### 4. 자동 동기화
- 한국 주식: 매일 00:00 (`StockSyncScheduler.syncKoreanStocks()`)
- 미국 주식: 매주 월요일 09:00 (`StockSyncScheduler.syncUsStocks()`)

---

## 🔍 확인 방법

### API Key 설정 확인
```bash
# Spring Boot 애플리케이션 시작 시 로그 확인
# Alpha Vantage API Key가 없으면 경고 메시지 출력
```

### 테스트
```bash
# 1. 한국 주식 검색 테스트
GET http://localhost:8080/api/stocks/search?query=삼성전자&market=KR

# 2. 미국 주식 검색 테스트
GET http://localhost:8080/api/stocks/search?query=AAPL&market=US
```

---

## 📚 참고 문서

- [Alpha Vantage API 문서](https://www.alphavantage.co/documentation/)
- [KRX Open API 문서](http://openapigw.krx.co.kr/)
- [SEC Edgar API 문서](https://www.sec.gov/edgar/sec-api-documentation)

