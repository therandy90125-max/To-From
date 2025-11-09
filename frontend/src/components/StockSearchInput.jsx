import React, { useState, useEffect, useRef } from 'react';
import { searchStocks } from '../config/api';
import CurrencyDisplay from './CurrencyDisplay';

/**
 * 주식 검색 입력 컴포넌트 (한국 + 미국 주식 지원)
 * Stock Search Input with Exchange Badges and Market Filter
 */
const StockSearchInput = ({ onSelectStock, placeholder = "Search stocks...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [market, setMarket] = useState('ALL'); // 'ALL', 'KR', 'US'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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

  // Search stocks with market filter
  const performSearch = async (searchQuery, marketFilter) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // 이미 로딩 상태이므로 setLoading(true) 제거
    setError(null);

    try {
      const searchResults = await searchStocks(searchQuery, marketFilter);
      setResults(searchResults || []);
      // 결과가 있으면 드롭다운 표시
      if (searchResults && searchResults.length > 0) {
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Stock search error:', err);
      setResults([]);
      setError(err.message || '검색에 실패했습니다. 다시 시도하세요.');
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
