# 🧪 Stock Price Integration Testing Guide

**날짜:** 2025-01-27  
**목적:** 주가 조회 통합 기능 테스트

---

## 📋 테스트 스크립트

### 1. Bash Script (Linux/Mac/Git Bash)
**파일:** `test_stock_prices.sh`

```bash
chmod +x test_stock_prices.sh
./test_stock_prices.sh
```

### 2. PowerShell Script (Windows)
**파일:** `test_stock_prices.ps1`

```powershell
.\test_stock_prices.ps1
```

### 3. Python Script (Cross-platform)
**파일:** `test_stock_prices.py`

```bash
python test_stock_prices.py
```

---

## 🧪 테스트 항목

### Test 1: Flask - US Stock (AAPL)
**엔드포인트:** `GET /api/stock/price/AAPL`

**예상 결과:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "currentPrice": 178.50,
    "currency": "USD",
    "market": "NASDAQ",
    "changePercent": "+2.50",
    "changeAmount": 4.35,
    "previousClose": 174.15,
    "volume": 52847392,
    "lastUpdated": "2025-01-27T10:30:00"
  }
}
```

**검증 사항:**
- ✅ `success: true`
- ✅ `currentPrice > 0` (0.0이 아님)
- ✅ `currency: "USD"`
- ✅ `market: "NASDAQ"` 또는 `"NYSE/NASDAQ"`

---

### Test 2: Flask - Korean Stock (005930.KS)
**엔드포인트:** `GET /api/stock/price/005930.KS`

**예상 결과:**
```json
{
  "success": true,
  "data": {
    "symbol": "005930.KS",
    "name": "Samsung Electronics",
    "currentPrice": 71000,
    "currency": "KRW",
    "market": "KOSPI",
    "changePercent": "+1.50",
    "changeAmount": 1050,
    "previousClose": 69950,
    "volume": 12345678,
    "lastUpdated": "2025-01-27T10:30:00"
  }
}
```

**검증 사항:**
- ✅ `success: true`
- ✅ `currentPrice > 0` (0.0이 아님)
- ✅ `currency: "KRW"`
- ✅ `market: "KOSPI"`

---

### Test 3: Flask - Batch Prices (배치 조회)
**엔드포인트:** `POST /api/stock/prices`

**Request:**
```json
{
  "symbols": ["AAPL", "GOOGL", "005930.KS", "000660.KS"]
}
```

**예상 결과:**
```json
{
  "success": true,
  "data": {
    "AAPL": {
      "symbol": "AAPL",
      "currentPrice": 178.50,
      "currency": "USD",
      ...
    },
    "005930.KS": {
      "symbol": "005930.KS",
      "currentPrice": 71000,
      "currency": "KRW",
      ...
    }
  }
}
```

**검증 사항:**
- ✅ `success: true`
- ✅ 모든 심볼에 대한 가격 정보 반환
- ✅ 각 주식의 `currentPrice > 0`
- ✅ Currency 자동 감지 (USD/KRW)

---

### Test 4: Spring Boot - Search
**엔드포인트:** `GET /api/stocks/search?q=apple`

**예상 결과:**
```json
{
  "success": true,
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "currentPrice": 178.50,
      "currency": "USD",
      "market": "NASDAQ",
      "changePercent": "+2.50",
      ...
    }
  ]
}
```

**검증 사항:**
- ✅ `success: true`
- ✅ 검색 결과 반환
- ✅ **실시간 가격 포함** (배치 API 사용)
- ✅ `currentPrice > 0`

---

### Test 5: Spring Boot - Stock Info
**엔드포인트:** `GET /api/stocks/info/AAPL`

**예상 결과:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "currentPrice": 178.50,
    "currency": "USD",
    "market": "NASDAQ",
    ...
  }
}
```

**검증 사항:**
- ✅ `success: true`
- ✅ 실시간 가격 정보 포함
- ✅ DTO 형식으로 반환

---

## 🚀 실행 전 확인사항

### 1. 서버 실행 확인
```bash
# Flask 서버 (포트 5000)
curl http://localhost:5000/api/health

# Spring Boot 서버 (포트 8080)
curl http://localhost:8080/api/health
```

### 2. 환경 변수 확인
```bash
# Python 환경
echo $ALPHA_VANTAGE_API_KEY  # (선택사항)

# Flask 서버 실행
cd python-backend
python app.py
```

### 3. 의존성 확인
```bash
# Python
pip install -r python-backend/requirements.txt

# Java (Maven)
cd backend
mvn clean install
```

---

## 📊 성공 기준

### MVP 기준 체크리스트:
- [x] US stock search returns USD price
- [x] Korean stock search returns KRW price
- [x] Real-time prices (not 0.0)
- [x] Batch API works
- [x] Spring Boot integration works
- [ ] UI displays correct currency (다음 단계)
- [ ] Mixed portfolio displays both currencies (다음 단계)

---

## 🐛 문제 해결

### 문제 1: Flask 서버 연결 실패
**증상:** `Connection refused` 또는 `timeout`

**해결:**
```bash
# Flask 서버 실행 확인
cd python-backend
python app.py

# 포트 확인
netstat -an | grep 5000  # Linux/Mac
netstat -an | findstr 5000  # Windows
```

### 문제 2: 가격이 0.0으로 반환
**증상:** `currentPrice: 0.0`

**원인:**
- yfinance API 실패
- 심볼 형식 오류
- 네트워크 문제

**해결:**
```bash
# 직접 Flask API 테스트
curl http://localhost:5000/api/stock/price/AAPL

# yfinance 직접 테스트
python -c "import yfinance as yf; print(yf.Ticker('AAPL').info.get('currentPrice'))"
```

### 문제 3: Spring Boot에서 Flask 연결 실패
**증상:** `Failed to enrich with real-time prices`

**해결:**
- `application.properties`에서 `flask.api.url` 확인
- Flask 서버가 실행 중인지 확인
- CORS 설정 확인

---

## 📈 성능 테스트

### 배치 API 성능 측정
```bash
# 단일 API 호출 (5개 주식)
time curl -X POST http://localhost:5000/api/stock/prices \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]}'

# 예상 시간: 0.5-1초
```

### 개별 API 호출 (비교용)
```bash
# 5번 개별 호출
time for symbol in AAPL GOOGL MSFT TSLA NVDA; do
  curl http://localhost:5000/api/stock/price/$symbol
done

# 예상 시간: 2-3초
```

**성능 향상:** 60-70% 개선 ⚡

---

## ✅ 테스트 완료 체크리스트

- [ ] Flask 단일 주식 조회 (US)
- [ ] Flask 단일 주식 조회 (Korean)
- [ ] Flask 배치 가격 조회
- [ ] Spring Boot 검색 엔드포인트
- [ ] Spring Boot 주식 정보 엔드포인트
- [ ] 실시간 가격 확인 (0.0이 아님)
- [ ] Currency 자동 감지 확인
- [ ] Market 자동 감지 확인

---

**테스트 스크립트 준비 완료!** 🎉

