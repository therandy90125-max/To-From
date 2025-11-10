import React, { useState, useEffect, useRef } from 'react';
import { searchStocks } from '../config/api';
import CurrencyDisplay from './CurrencyDisplay';

/**
 * 주식 검색 입력 컴포넌트 (한국 + 미국 주식 지원)
 * Stock Search Input with Local Database + API Fallback
 * 
 * Features:
 * - Local database for 60 popular stocks (instant search)
 * - API fallback for extended search (Alpha Vantage + yfinance)
 * - Exchange badges and market filtering
 */

// 🚀 Local Popular Stocks Database (60 stocks for instant search)
const POPULAR_STOCKS = [
  // 한국 주식 (20개)
  { symbol: '005930.KS', ticker: '005930.KS', name: '삼성전자', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '000660.KS', ticker: '000660.KS', name: 'SK하이닉스', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '035420.KS', ticker: '035420.KS', name: 'NAVER', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '035720.KS', ticker: '035720.KS', name: '카카오', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '051910.KS', ticker: '051910.KS', name: 'LG화학', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '006400.KS', ticker: '006400.KS', name: '삼성SDI', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '207940.KS', ticker: '207940.KS', name: '삼성바이오로직스', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '005380.KS', ticker: '005380.KS', name: '현대차', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '000270.KS', ticker: '000270.KS', name: '기아', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '068270.KS', ticker: '068270.KS', name: '셀트리온', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '028260.KS', ticker: '028260.KS', name: '삼성물산', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '105560.KS', ticker: '105560.KS', name: 'KB금융', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '055550.KS', ticker: '055550.KS', name: '신한지주', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '086790.KS', ticker: '086790.KS', name: '하나금융지주', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '032830.KS', ticker: '032830.KS', name: '삼성생명', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '017670.KS', ticker: '017670.KS', name: 'SK텔레콤', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '030200.KS', ticker: '030200.KS', name: 'KT', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '009150.KS', ticker: '009150.KS', name: '삼성전기', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '000810.KS', ticker: '000810.KS', name: '삼성화재', market: 'KOSPI', exchange: 'KOSPI' },
  { symbol: '036570.KS', ticker: '036570.KS', name: '엔씨소프트', market: 'KOSPI', exchange: 'KOSPI' },
  
  // 미국 주식 - 기술주 (20개)
  { symbol: 'AAPL', ticker: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'MSFT', ticker: 'MSFT', name: 'Microsoft Corporation', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', ticker: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'AMZN', ticker: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'TSLA', ticker: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'NVDA', ticker: 'NVDA', name: 'NVIDIA Corporation', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'META', ticker: 'META', name: 'Meta Platforms Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'NFLX', ticker: 'NFLX', name: 'Netflix Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'INTC', ticker: 'INTC', name: 'Intel Corporation', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'AMD', ticker: 'AMD', name: 'Advanced Micro Devices', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'ADBE', ticker: 'ADBE', name: 'Adobe Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'CSCO', ticker: 'CSCO', name: 'Cisco Systems', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'AVGO', ticker: 'AVGO', name: 'Broadcom Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'ORCL', ticker: 'ORCL', name: 'Oracle Corporation', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'CRM', ticker: 'CRM', name: 'Salesforce Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'QCOM', ticker: 'QCOM', name: 'Qualcomm Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'TXN', ticker: 'TXN', name: 'Texas Instruments', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'PYPL', ticker: 'PYPL', name: 'PayPal Holdings', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'UBER', ticker: 'UBER', name: 'Uber Technologies', market: 'NASDAQ', exchange: 'NASDAQ' },
  { symbol: 'SHOP', ticker: 'SHOP', name: 'Shopify Inc.', market: 'NASDAQ', exchange: 'NASDAQ' },
  
  // 미국 주식 - 금융/산업 (20개)
  { symbol: 'BRK.B', ticker: 'BRK.B', name: 'Berkshire Hathaway', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'JPM', ticker: 'JPM', name: 'JPMorgan Chase & Co.', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'V', ticker: 'V', name: 'Visa Inc.', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'MA', ticker: 'MA', name: 'Mastercard', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'WMT', ticker: 'WMT', name: 'Walmart Inc.', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'JNJ', ticker: 'JNJ', name: 'Johnson & Johnson', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'PG', ticker: 'PG', name: 'Procter & Gamble', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'DIS', ticker: 'DIS', name: 'Walt Disney Company', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'BAC', ticker: 'BAC', name: 'Bank of America', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'XOM', ticker: 'XOM', name: 'Exxon Mobil', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'CVX', ticker: 'CVX', name: 'Chevron Corporation', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'KO', ticker: 'KO', name: 'Coca-Cola Company', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'PEP', ticker: 'PEP', name: 'PepsiCo Inc.', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'MCD', ticker: 'MCD', name: "McDonald's Corporation", market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'NKE', ticker: 'NKE', name: 'Nike Inc.', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'HD', ticker: 'HD', name: 'Home Depot', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'UNH', ticker: 'UNH', name: 'UnitedHealth Group', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'GS', ticker: 'GS', name: 'Goldman Sachs', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'MS', ticker: 'MS', name: 'Morgan Stanley', market: 'NYSE', exchange: 'NYSE' },
  { symbol: 'BA', ticker: 'BA', name: 'Boeing Company', market: 'NYSE', exchange: 'NYSE' },
];

const StockSearchInput = ({ onSelectStock, placeholder = "Search stocks...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [market, setMarket] = useState('ALL'); // 'ALL', 'KR', 'US'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchSource, setSearchSource] = useState('local'); // 'local' or 'api'
  const dropdownRef = useRef(null);

  // Helper function for highlighting
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <span key={index} className="bg-yellow-200 dark:bg-yellow-700 font-semibold">{part}</span>;
      }
      return part;
    });
  };

  // Get exchange badge color
  const getExchangeBadgeColor = (exchange) => {
    switch (exchange) {
      case 'KOSPI':
      case 'KOSDAQ':
      case 'KRX':
        return 'bg-blue-500';
      case 'NASDAQ':
      case 'NYSE':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get exchange flag
  const getExchangeFlag = (exchange) => {
    switch (exchange) {
      case 'KOSPI':
      case 'KOSDAQ':
      case 'KRX':
        return '🇰🇷';
      case 'NASDAQ':
      case 'NYSE':
        return '🇺🇸';
      default:
        return '🌐';
    }
  };

  // 🚀 Search local database first (instant), then fallback to API
  const searchLocalDatabase = (searchQuery, marketFilter) => {
    const query = searchQuery.toLowerCase().trim();
    
    return POPULAR_STOCKS.filter(stock => {
      // Market filter
      if (marketFilter === 'KR' && !['KOSPI', 'KOSDAQ', 'KRX'].includes(stock.market)) {
        return false;
      }
      if (marketFilter === 'US' && !['NASDAQ', 'NYSE'].includes(stock.market)) {
        return false;
      }
      
      // Text search (symbol or name)
      const symbolMatch = stock.symbol.toLowerCase().includes(query) || 
                         stock.ticker.toLowerCase().includes(query);
      const nameMatch = stock.name.toLowerCase().includes(query);
      
      return symbolMatch || nameMatch;
    });
  };

  // Search stocks with hybrid approach: Local DB → API
  const performSearch = async (searchQuery, marketFilter) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setResults([]);
      setError(null);
      setLoading(false);
      setSearchSource('local');
      return;
    }

    setError(null);

    try {
      // 1️⃣ Search local database first (instant response)
      const localResults = searchLocalDatabase(searchQuery, marketFilter);
      
      if (localResults.length > 0) {
        // ✅ Found in local database - instant response!
        console.log(`[StockSearch] ⚡ Found ${localResults.length} results in local database`);
        setResults(localResults);
        setSearchSource('local');
        setShowDropdown(true);
        setLoading(false);
        return;
      }
      
      // 2️⃣ Not found locally - fallback to API (Alpha Vantage + yfinance)
      console.log('[StockSearch] 🌐 Not found locally, searching API...');
      setSearchSource('api');
      
      const searchResults = await searchStocks(searchQuery, marketFilter);
      setResults(searchResults || []);
      
      if (searchResults && searchResults.length > 0) {
        console.log(`[StockSearch] ✅ Found ${searchResults.length} results from API`);
        setShowDropdown(true);
      } else {
        console.log('[StockSearch] ❌ No results from API');
      }
    } catch (err) {
      console.error('Stock search error:', err);
      setResults([]);
      setError(err.message || '검색에 실패했습니다. 다시 시도하세요.');
      setSearchSource('api');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search (150ms) - 빠른 실시간 검색
  useEffect(() => {
    // 빈 쿼리일 때는 즉시 초기화
    if (query.trim().length === 0) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // 최소 1자 이상 입력 시 검색 시작
    if (query.trim().length >= 1) {
      // 즉시 로딩 상태 표시
      setLoading(true);
      
      const timer = setTimeout(() => {
        performSearch(query, market);
      }, 150); // 300ms → 150ms로 단축

      return () => clearTimeout(timer);
    }
  }, [query, market]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // 입력 시 즉시 드롭다운 표시 (검색 결과 대기 중에도)
    if (newQuery.trim().length > 0) {
      setShowDropdown(true);
    }
    setError(null);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query.trim().length > 0) {
      e.preventDefault();
      performSearch(query, market);
    }
  };

  // Handle market filter change
  const handleMarketChange = (e) => {
    setMarket(e.target.value);
    setShowDropdown(true);
    if (query.trim().length > 0) {
      performSearch(query, e.target.value);
    }
  };

  // Handle stock selection
  const handleSelectStock = (stock) => {
    if (onSelectStock) {
      onSelectStock(stock);
    }
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  // Stock Item Component (defined inside StockSearchInput)
  const StockItem = ({ stock, query, onSelect, getExchangeBadgeColor, getExchangeFlag, highlightMatch }) => {
    return (
      <li
        onClick={() => onSelect(stock)}
        className="px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Ticker Symbol */}
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="font-mono font-semibold text-sm text-gray-900 dark:text-white truncate">
                {highlightMatch(stock.ticker || stock.symbol, query)}
              </span>
              
              {/* Exchange Badge */}
              <span className={`px-1.5 py-0.5 text-xs font-semibold text-white rounded flex-shrink-0 ${getExchangeBadgeColor(stock.market || stock.exchange)}`}>
                {getExchangeFlag(stock.market || stock.exchange)}
              </span>
            </div>
            
            {/* Company Name */}
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {highlightMatch(stock.name || stock.companyName, query)}
            </div>
          </div>

          {/* Arrow Icon */}
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </li>
    );
  };

  // Group results by market
  const groupResultsByMarket = (results) => {
    const korean = [];
    const us = [];
    
    results.forEach(stock => {
      const marketType = stock.market || stock.exchange || '';
      if (marketType === 'KRX' || marketType === 'KOSPI' || marketType === 'KOSDAQ' || 
          (stock.symbol || stock.ticker || '').match(/^\d{6}(\.KS|\.KQ)?$/)) {
        korean.push(stock);
      } else {
        us.push(stock);
      }
    });
    
    return { korean, us };
  };

  const { korean, us } = groupResultsByMarket(results);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Market Filter Dropdown + Search Input */}
      <div className="flex gap-2">
        {/* Market Filter Dropdown */}
        <select
          value={market}
          onChange={handleMarketChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     cursor-pointer"
        >
          <option value="ALL">전체</option>
          <option value="KR">한국</option>
          <option value="US">미국</option>
        </select>

        {/* Search Input */}
        <div className="relative flex-1 z-10">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500 relative z-10"
          />
        
        {/* Search Icon / Loading Spinner / Error Indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {error ? (
            <div className="group relative">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title={error}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {/* 작은 툴팁 (선택적) */}
              <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {error}
              </div>
            </div>
          ) : loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>
      </div>

      {/* Dropdown Results - Only show when there are results, not on error or loading */}
      {showDropdown && !loading && !error && results.length > 0 && (
        <div className="absolute z-30 w-full mt-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                        rounded-md shadow-md max-h-40 overflow-y-auto">
            {/* Search Source Indicator */}
            <div className={`px-2 py-1 text-xs font-medium ${
              searchSource === 'local' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            }`}>
              {searchSource === 'local' ? '⚡ 즉시 검색 (인기 종목)' : '🌐 API 검색 (전체)'}
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* 한국 주식 섹션 */}
              {korean.length > 0 && (
                <div>
                  <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                    🇰🇷 한국 주식
                  </div>
                  <ul>
                    {korean.map((stock, index) => (
                      <StockItem 
                        key={`kr-${stock.symbol || stock.ticker}-${index}`}
                        stock={stock}
                        query={query}
                        onSelect={handleSelectStock}
                        getExchangeBadgeColor={getExchangeBadgeColor}
                        getExchangeFlag={getExchangeFlag}
                        highlightMatch={highlightMatch}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {/* 미국 주식 섹션 */}
              {us.length > 0 && (
                <div>
                  <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold text-xs">
                    🇺🇸 미국 주식
                  </div>
                  <ul>
                    {us.map((stock, index) => (
                      <StockItem 
                        key={`us-${stock.symbol || stock.ticker}-${index}`}
                        stock={stock}
                        query={query}
                        onSelect={handleSelectStock}
                        getExchangeBadgeColor={getExchangeBadgeColor}
                        getExchangeFlag={getExchangeFlag}
                        highlightMatch={highlightMatch}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};

export default StockSearchInput;
