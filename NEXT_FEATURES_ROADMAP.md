# 🗺️ QuantaFolio Navigator - 다음 기능 로드맵

**기반:** PROJECT_COMPARISON_REPORT.md 권장사항  
**현재 완료:** Phase 1 - 실시간 주가 & 거래소 배지 ✅

---

## ✅ 완료된 기능 (2025-11-10)

### Phase 1: 실시간 주가 조회
- ✅ yfinance + Alpha Vantage 통합
- ✅ 60초 자동 새로고침
- ✅ 한국 주식 지원 (.KS, .KQ)
- ✅ 거래소 배지 (NASDAQ, NYSE, KOSPI, KOSDAQ, KRX, AMEX)
- ✅ 로딩 인디케이터
- ✅ 평균 단가 vs 현재가 비교

**커밋:** 72e5fbc  
**문서:** REALTIME_PRICE_FEATURE.md

---

## 🔜 다음 추가 기능 (Stock-Portfolio-Optimizer에서 이식)

### Phase 2: 환율 위젯 (1-2시간)

**Stock-Portfolio의 장점:**
- 실시간 USD ↔ KRW 환율
- 자동 변환 계산
- 깔끔한 UI

**구현 계획:**

#### 1. Backend API 추가

**Spring Boot 컨트롤러:**
```java
// backend/src/main/java/com/toandfrom/toandfrom/controller/CurrencyController.java
package com.toandfrom.toandfrom.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/currency")
@CrossOrigin(origins = "http://localhost:5173")
public class CurrencyController {

    private static final String EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";
    
    @GetMapping("/rate")
    public Map<String, Object> getExchangeRate(
        @RequestParam(defaultValue = "USD") String from,
        @RequestParam(defaultValue = "KRW") String to
    ) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.getForObject(EXCHANGE_RATE_API, Map.class);
            
            if (response != null && response.containsKey("rates")) {
                Map<String, Double> rates = (Map<String, Double>) response.get("rates");
                double rate = rates.getOrDefault(to, 1.0);
                
                return Map.of(
                    "success", true,
                    "from", from,
                    "to", to,
                    "rate", rate,
                    "timestamp", System.currentTimeMillis()
                );
            }
            
            return Map.of("success", false, "error", "Failed to fetch rates");
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    @PostMapping("/convert")
    public Map<String, Object> convert(@RequestBody Map<String, Object> request) {
        try {
            double amount = ((Number) request.get("amount")).doubleValue();
            String from = (String) request.getOrDefault("from", "USD");
            String to = (String) request.getOrDefault("to", "KRW");
            
            // Get rate
            Map<String, Object> rateResponse = getExchangeRate(from, to);
            if ((Boolean) rateResponse.get("success")) {
                double rate = (Double) rateResponse.get("rate");
                double converted = amount * rate;
                
                return Map.of(
                    "success", true,
                    "amount", amount,
                    "from", from,
                    "to", to,
                    "rate", rate,
                    "converted", converted
                );
            }
            
            return rateResponse;
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}
```

#### 2. Frontend 컴포넌트

**ExchangeRateWidget.jsx:**
```javascript
// frontend/src/components/ExchangeRateWidget.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const ExchangeRateWidget = ({ amount = 1, from = 'USD', to = 'KRW', showConverter = true }) => {
  const { t, language } = useLanguage();
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState(amount);
  const [converted, setConverted] = useState(0);

  useEffect(() => {
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60000); // 60초 갱신
    return () => clearInterval(interval);
  }, [from, to]);

  useEffect(() => {
    if (rate) {
      setConverted(customAmount * rate);
    }
  }, [customAmount, rate]);

  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/currency/rate?from=${from}&to=${to}`);
      
      if (response.data.success) {
        setRate(response.data.rate);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="exchange-rate-widget loading">
        <span>🔄 Loading exchange rate...</span>
      </div>
    );
  }

  return (
    <div className="exchange-rate-widget">
      <div className="rate-display">
        <div className="rate-header">
          <span className="flag">{from === 'USD' ? '🇺🇸' : '🇰🇷'}</span>
          <span className="currency">{from}</span>
          <span className="arrow">→</span>
          <span className="flag">{to === 'KRW' ? '🇰🇷' : '🇺🇸'}</span>
          <span className="currency">{to}</span>
        </div>
        <div className="rate-value">
          <strong>1 {from}</strong> = <strong>{rate?.toFixed(2)} {to}</strong>
        </div>
      </div>

      {showConverter && (
        <div className="converter">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="amount-input"
          />
          <span className="currency-label">{from}</span>
          <span className="equals">=</span>
          <div className="converted-value">
            {converted.toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <span className="currency-label">{to}</span>
        </div>
      )}

      <style jsx>{`
        .exchange-rate-widget {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 16px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .rate-display {
          margin-bottom: 12px;
        }

        .rate-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .flag {
          font-size: 20px;
        }

        .arrow {
          color: rgba(255, 255, 255, 0.8);
        }

        .rate-value {
          font-size: 18px;
          font-weight: 600;
        }

        .converter {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 12px;
          border-radius: 8px;
        }

        .amount-input {
          width: 100px;
          padding: 8px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
        }

        .currency-label {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.9;
        }

        .equals {
          font-size: 18px;
          font-weight: bold;
        }

        .converted-value {
          flex: 1;
          font-size: 18px;
          font-weight: 700;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default ExchangeRateWidget;
```

#### 3. Dashboard에 통합

```javascript
// frontend/src/components/Dashboard.jsx에 추가
import ExchangeRateWidget from './ExchangeRateWidget';

// Portfolio summary 섹션에 추가
<div className="sidebar-widget">
  <h4>{t('exchangeRate')}</h4>
  <ExchangeRateWidget from="USD" to="KRW" showConverter={true} />
</div>
```

#### 4. 번역 추가

```javascript
// frontend/src/utils/i18n.js
export const translations = {
  ko: {
    // ... existing translations
    exchangeRate: '환율',
    currencyConverter: '환율 변환기',
    convertAmount: '금액 변환',
  },
  en: {
    // ... existing translations
    exchangeRate: 'Exchange Rate',
    currencyConverter: 'Currency Converter',
    convertAmount: 'Convert Amount',
  }
};
```

---

### Phase 3: 향상된 StockSearchInput (30분-1시간)

**Stock-Portfolio의 장점:**
- 독립적으로 재사용 가능
- 한국/미국 주식 자동 감지
- 깔끔한 드롭다운 UI

**현재 To-From의 StockSearchInput 개선:**

```javascript
// frontend/src/components/StockSearchInput.jsx 개선
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const StockSearchInput = ({ onSelectStock, placeholder }) => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 디바운스 검색
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      searchStocks(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchStocks = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/stocks/search?q=${searchQuery}`);
      const data = await response.json();

      if (data.success && data.results) {
        setResults(data.results);
        setShowDropdown(data.results.length > 0);
      }
    } catch (error) {
      console.error('Stock search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (stock) => {
    onSelectStock(stock);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  // 거래소 배지 컴포넌트
  const ExchangeBadge = ({ exchange }) => {
    const badges = {
      'NASDAQ': { bg: '#0066cc', text: 'NASDAQ', flag: '🇺🇸' },
      'NYSE': { bg: '#003d82', text: 'NYSE', flag: '🇺🇸' },
      'KOSPI': { bg: '#e63946', text: 'KOSPI', flag: '🇰🇷' },
      'KOSDAQ': { bg: '#f77f00', text: 'KOSDAQ', flag: '🇰🇷' },
      'KRX': { bg: '#d62828', text: 'KRX', flag: '🇰🇷' },
    };

    const badge = badges[exchange] || { bg: '#6c757d', text: exchange, flag: '🌐' };

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        borderRadius: '10px',
        backgroundColor: badge.bg,
        color: 'white',
        fontSize: '10px',
        fontWeight: '600',
      }}>
        <span>{badge.flag}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  return (
    <div className="stock-search-input" ref={dropdownRef}>
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t('searchStockPlaceholder')}
          className="search-input"
        />
        {loading && <span className="loading-icon">🔄</span>}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="dropdown-results">
          {results.map((stock, index) => (
            <div
              key={index}
              className="result-item"
              onClick={() => handleSelect(stock)}
            >
              <div className="stock-info">
                <div className="stock-header">
                  <span className="ticker">{stock.ticker}</span>
                  <ExchangeBadge exchange={stock.exchange} />
                </div>
                <span className="name">{stock.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .stock-search-input {
          position: relative;
          width: 100%;
        }

        .search-box {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #4A90E2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .loading-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }

        .dropdown-results {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }

        .result-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item:hover {
          background: #f8f9fa;
        }

        .stock-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stock-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ticker {
          font-size: 14px;
          font-weight: 700;
          color: #2c3e50;
        }

        .name {
          font-size: 13px;
          color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

export default StockSearchInput;
```

---

### Phase 4: 주식 활동 히스토리 (1시간)

**Stock-Portfolio의 장점:**
- Dashboard에 최근 활동 표시
- 추가/수정/삭제 이력

**구현:**
```javascript
// Activity log component
const RecentActivity = ({ activities }) => {
  return (
    <div className="recent-activity">
      <h4>Recent Activity</h4>
      {activities.map((activity, idx) => (
        <div key={idx} className="activity-item">
          <span className="activity-icon">{activity.icon}</span>
          <div className="activity-details">
            <p>{activity.message}</p>
            <small>{activity.timestamp}</small>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 📊 우선순위 추천

| 순위 | 기능 | 예상 시간 | 사용자 가치 | 구현 난이도 |
|-----|------|----------|-----------|-----------|
| 🥇 | **환율 위젯** | 1-2시간 | ⭐⭐⭐⭐⭐ | 중간 |
| 🥈 | **향상된 StockSearch** | 30분-1시간 | ⭐⭐⭐⭐ | 쉬움 |
| 🥉 | **활동 히스토리** | 1시간 | ⭐⭐⭐ | 중간 |

---

## 🎯 최종 권장사항

### 즉시 추가 (다음 세션):
1. ✅ **환율 위젯** - 한국 사용자에게 필수
2. ✅ **StockSearchInput 개선** - UX 향상

### 선택적 추가:
3. ⚠️ **활동 히스토리** - Nice to have
4. ⚠️ **주식 뉴스 피드** - 추가 API 필요
5. ⚠️ **가격 알림** - 복잡도 높음

---

## 📝 다음 작업 요청 시 사용할 명령어

```
다음 기능을 추가해주세요:
1. 환율 위젯 (USD ↔ KRW)
2. StockSearchInput 컴포넌트 개선

예상 시간: 2-3시간
```

---

**작성일:** 2025-11-10  
**기반:** PROJECT_COMPARISON_REPORT.md  
**현재 Phase:** Phase 1 완료 ✅  
**다음 Phase:** Phase 2 (환율 위젯)

