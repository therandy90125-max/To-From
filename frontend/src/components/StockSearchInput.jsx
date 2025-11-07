import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * 주식 검색 입력 컴포넌트 (한국 + 미국 주식 지원)
 * Stock Search Input with Exchange Badges
 */
const StockSearchInput = ({ onSelectStock, placeholder = "Search stocks...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  // Search stocks
  const searchStocks = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`/api/portfolio/stock/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (response.data.success && response.data.results) {
        setResults(response.data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Stock search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
    setQuery(e.target.value);
    setShowDropdown(true);
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

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={index} className="bg-yellow-200 dark:bg-yellow-700 font-semibold">{part}</span> : 
        part
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
        
        {/* Search Icon / Loading Spinner */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (query.length > 0 || results.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                        rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {query.length > 0 ? '🔍 No results found' : 'Start typing to search...'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((stock, index) => (
                <li
                  key={`${stock.ticker || stock.symbol}-${index}`}
                  onClick={() => handleSelectStock(stock)}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Ticker Symbol */}
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {highlightMatch(stock.ticker || stock.symbol, query)}
                        </span>
                        
                        {/* Exchange Badge */}
                        <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded ${getExchangeBadgeColor(stock.exchange)}`}>
                          {getExchangeFlag(stock.exchange)} {stock.exchange}
                        </span>
                      </div>
                      
                      {/* Company Name */}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {highlightMatch(stock.name, query)}
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearchInput;
