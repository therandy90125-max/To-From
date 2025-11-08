# 📊 MVP 상태 보고서 (Status Report)

**날짜:** 2025-01-27  
**목표:** 배포 가능한 최소 기능 (MVP) 달성

---

## ✅ 완료된 기능 (Completed)

### 1. ✅ Phase 0: Critical Fixes
- [x] API key 보안 (환경 변수로 이동)
- [x] Quantum optimization timeout (5분)
- [x] 코드 리팩토링 (203줄 → 3개 helper methods)

### 2. ✅ Currency Service (Backend)
- [x] `CurrencyService.java` 생성 완료
- [x] 실시간 환율 API 연동 (exchangerate-api.com)
- [x] 1시간 캐싱
- [x] USD ↔ KRW 변환 메서드
- [x] Symbol에서 currency/market 자동 감지

### 3. ✅ Stock Search (부분 완료)
- [x] US + Korean stock 검색 기능
- [x] Market detection (KOSPI/KOSDAQ/NASDAQ/NYSE)
- [x] Currency detection (USD/KRW)
- [x] Frontend 검색 UI (StockSearchInput.jsx)
- [x] Python Flask API (`/api/stocks/search`)

---

## ⚠️ 부분 완료 (Partially Complete)

### 1. ⚠️ Stock Search Response
**현재 상태:**
- ✅ 검색 결과 반환 (ticker, name, exchange, currency, market)
- ❌ **실시간 주가 가격 없음** (`currentPrice: 0.0`)
- ❌ **DTO 없음** (Map<String, String> 사용 중)

**필요한 작업:**
```java
// 생성 필요: StockSearchResponseDTO.java
public class StockSearchResponseDTO {
    private String symbol;
    private String name;
    private BigDecimal price;      // ❌ 현재 0.0
    private String currency;       // ✅ 있음
    private String market;         // ✅ 있음
    private String changePercent;  // ❌ 없음
}
```

### 2. ⚠️ Frontend Currency Display
**현재 상태:**
- ✅ `currencyUtils.js` 존재 (formatCurrency, getCurrencySymbol 등)
- ✅ 언어 기반 currency symbol (₩/$)
- ❌ **react-i18next 미설치** (i18n 없음)
- ❌ **번역 파일 없음** (en.json, ko.json)
- ⚠️ 브라우저 언어 자동 감지 없음

**필요한 작업:**
```bash
npm install react-i18next i18next
# + 번역 파일 생성
```

### 3. ⚠️ Quantum Optimization Profitability
**현재 상태:**
- ✅ 기본 수익률 계산 (`calculate_returns()`)
- ✅ Mean-variance optimization
- ❌ **Profitability-focused objective 없음**
- ❌ **Historical return calculation 없음**
- ❌ **Backtesting 없음**

**필요한 작업:**
- Expected return 계산 강화
- QAOA cost function에 return weight 증가 (alpha=0.7)
- Backtesting 기능 추가

---

## ❌ 미완료 (Not Complete)

### 1. ❌ Mixed Portfolio Currency Display
**현재 상태:**
- ❌ US + Korean 주식 혼합 포트폴리오에서 두 통화 동시 표시 없음
- ❌ 환율 정보 표시 없음

**필요한 작업:**
- Portfolio summary에 USD/KRW 분리 표시
- Exchange rate 정보 표시
- 각 주식별 원래 통화 표시

### 2. ❌ Real-time Stock Price in Search
**현재 상태:**
- `getStockInfo()` 메서드에서 `currentPrice: 0.0` 반환
- Python Flask API는 실시간 가격 있음 (`/api/stock/price/<symbol>`)
- Java backend에서 Flask API 호출 필요

---

## 📋 MVP 성공 기준 체크리스트

| 기준 | 상태 | 완성도 | 우선순위 |
|------|------|--------|----------|
| **US + Korean stock search working** | ⚠️ 부분 | 70% | 🔴 HIGH |
| **Real-time currency conversion** | ✅ 완료 | 100% | - |
| **UI displays correct currency** | ⚠️ 부분 | 60% | 🟡 MEDIUM |
| **Quantum optimization considers returns** | ⚠️ 부분 | 50% | 🟡 MEDIUM |
| **Mixed portfolio displays both currencies** | ❌ 미완료 | 0% | 🟡 MEDIUM |
| **Backtest shows positive returns** | ❌ 미완료 | 0% | 🟢 LOW |
| **Quantum > equal-weight** | ❌ 미완료 | 0% | 🟢 LOW |
| **Sharpe ratio > 1.0** | ❌ 미완료 | 0% | 🟢 LOW |

---

## 🎯 즉시 필요한 작업 (Immediate Actions)

### 🔴 HIGH PRIORITY (MVP 블로커)

#### 1. StockSearchResponseDTO 생성 + 실시간 가격 연동
**파일:** `backend/src/main/java/com/toandfrom/toandfrom/dto/StockSearchResponseDTO.java`
**작업:**
- DTO 클래스 생성
- `StockSearchService.getStockInfo()` 수정하여 Flask API 호출
- 실시간 가격 반환

**예상 시간:** 1-2시간

#### 2. Stock Search에 실시간 가격 추가
**파일:** `StockSearchService.java`
**작업:**
- Flask `/api/stock/price/<symbol>` 호출
- `currentPrice`, `changePercent` 추가

**예상 시간:** 1시간

---

### 🟡 MEDIUM PRIORITY (UX 개선)

#### 3. Frontend i18n 설치 및 설정
**작업:**
```bash
npm install react-i18next i18next
```
- `frontend/src/locales/en.json` 생성
- `frontend/src/locales/ko.json` 생성
- `i18n.js` 설정 파일 생성
- 브라우저 언어 자동 감지

**예상 시간:** 2-3시간

#### 4. Quantum Optimization Profitability Enhancement
**파일:** `python-backend/optimizer.py`
**작업:**
- Historical return calculation 강화
- QAOA cost function에 alpha=0.7 (return weight)
- Backtesting 기능 추가

**예상 시간:** 3-4시간

#### 5. Mixed Portfolio Currency Display
**파일:** `frontend/src/components/PortfolioOptimizer.jsx`
**작업:**
- USD/KRW 분리 표시
- Exchange rate 정보 표시
- 각 주식별 원래 통화 표시

**예상 시간:** 2-3시간

---

## 📊 우선순위별 작업 계획

### Phase 1: MVP 블로커 해결 (2-3시간)
1. ✅ ~~Critical fixes~~ (완료)
2. 🔴 **StockSearchResponseDTO 생성** (1-2시간)
3. 🔴 **실시간 가격 연동** (1시간)

### Phase 2: UX 개선 (5-7시간)
4. 🟡 Frontend i18n (2-3시간)
5. 🟡 Mixed portfolio currency display (2-3시간)
6. 🟡 Quantum profitability (3-4시간)

### Phase 3: 테스트 및 검증 (2-3시간)
7. 🟢 Backtesting 구현
8. 🟢 Profitability 테스트
9. 🟢 Sharpe ratio 검증

---

## 🚀 추천 시작 순서

### 옵션 A: 빠른 MVP 달성 (3-4시간)
1. StockSearchResponseDTO 생성
2. 실시간 가격 연동
3. Frontend i18n 기본 설정

**결과:** MVP 기준 80% 달성

### 옵션 B: 완전한 MVP (6-8시간)
1. 옵션 A + 
2. Mixed portfolio currency display
3. Quantum profitability enhancement

**결과:** MVP 기준 100% 달성

### 옵션 C: 프로덕션 준비 (10-12시간)
1. 옵션 B +
2. Backtesting
3. Performance 테스트
4. 문서화

**결과:** 프로덕션 배포 가능

---

## 💡 결정 필요 사항

1. **어느 옵션으로 진행할까요?** (A/B/C)
2. **Currency API:** 현재 `exchangerate-api.com` 사용 중 (무료: 1,500 req/month)
   - 대안: `fixer.io`, `currencyapi.com` (유료)
3. **우선순위 변경:** 한국 주식만 먼저 완성할까요?

---

**현재 MVP 완성도: 65%**  
**다음 단계 완료 시: 80-100%**

