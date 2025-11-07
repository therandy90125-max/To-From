import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 실시간 주가 표시 위젯
 * Real-time Stock Price Widget
 */
const StockPriceWidget = ({ symbol, showDetails = false }) => {
  const { t } = useLanguage();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Normalize Korean stock symbols
  const normalizeSymbol = (sym) => {
    if (!sym) return sym;
    // If it's 6 digits, add .KS
    if (/^\d{6}$/.test(sym)) {
      return `${sym}.KS`;
    }
    return sym;
  };

  const fetchStockPrice = async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const normalizedSymbol = normalizeSymbol(symbol);
      const response = await axios.get(`/api/portfolio/stock/price/${normalizedSymbol}`);
      
      if (response.data.success) {
        setStockData(response.data);
        setLastUpdate(new Date());
      } else {
        setError(response.data.error || 'Failed to fetch stock price');
      }
    } catch (err) {
      console.error('Stock price fetch error:', err);
      setError(err.response?.data?.error || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStockPrice();
  }, [symbol]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStockPrice();
    }, 60000);

    return () => clearInterval(interval);
  }, [symbol]);

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

  // Format price with currency
  const formatPrice = (price, exchange) => {
    if (!price) return '-';
    
    const isKorean = ['KOSPI', 'KOSDAQ', 'KRX'].includes(exchange);
    
    if (isKorean) {
      return `₩${price.toLocaleString('ko-KR')}`;
    } else {
      return `₩${price.toLocaleString('ko-KR')}`;
    }
  };

  // Render loading state
  if (loading && !stockData) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span>Loading...</span>
      </div>
    );
  }

  // Render error state
  if (error && !stockData) {
    return (
      <div className="text-sm text-red-500">
        <span>⚠️ {error}</span>
      </div>
    );
  }

  // Render no data state
  if (!stockData) {
    return null;
  }

  // Compact view (default)
  if (!showDetails) {
    return (
      <div className="inline-flex items-center space-x-2">
        {/* Exchange Badge */}
        <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded ${getExchangeBadgeColor(stockData.exchange)}`}>
          {getExchangeFlag(stockData.exchange)} {stockData.exchange}
        </span>

        {/* Price */}
        <span className="text-lg font-bold text-gray-800 dark:text-white">
          {formatPrice(stockData.currentPrice, stockData.exchange)}
        </span>

        {/* Change */}
        <span className={`text-sm font-semibold ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {stockData.change >= 0 ? '▲' : '▼'} {Math.abs(stockData.change).toLocaleString()} ({stockData.changePercent.toFixed(2)}%)
        </span>

        {/* Refresh Button */}
        <button
          onClick={fetchStockPrice}
          disabled={loading}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    );
  }

  // Detailed view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${getExchangeBadgeColor(stockData.exchange)}`}>
            {getExchangeFlag(stockData.exchange)} {stockData.exchange}
          </span>
          <span className="text-sm font-medium text-gray-500">{stockData.symbol}</span>
        </div>
        <button
          onClick={fetchStockPrice}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Refresh"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Company Name */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        {stockData.name}
      </h3>

      {/* Price & Change */}
      <div className="flex items-baseline space-x-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatPrice(stockData.currentPrice, stockData.exchange)}
        </span>
        <span className={`text-xl font-semibold ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {stockData.change >= 0 ? '▲' : '▼'} {Math.abs(stockData.change).toLocaleString()} ({stockData.changePercent.toFixed(2)}%)
        </span>
      </div>

      {/* Exchange Rate (for foreign stocks) */}
      {stockData.exchangeRate && (
        <div className="text-sm text-gray-500">
          💱 Exchange Rate: 1 USD = ₩{stockData.exchangeRate.toLocaleString('ko-KR')}
        </div>
      )}

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500">Volume</p>
          <p className="text-sm font-semibold">{stockData.volume?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Market Cap</p>
          <p className="text-sm font-semibold">
            {stockData.marketCap ? `₩${(stockData.marketCap / 1000000000000).toFixed(2)}T` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">52W High</p>
          <p className="text-sm font-semibold">{formatPrice(stockData.high52Week, stockData.exchange)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">52W Low</p>
          <p className="text-sm font-semibold">{formatPrice(stockData.low52Week, stockData.exchange)}</p>
        </div>
      </div>

      {/* Data Source & Timestamp */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
        <span>
          {stockData.dataSource === 'yfinance' ? '📊 Yahoo Finance' : '🎭 Mock Data'}
          {stockData.marketState && ` • ${stockData.marketState}`}
        </span>
        {lastUpdate && (
          <span>
            Updated: {lastUpdate.toLocaleTimeString('ko-KR')}
          </span>
        )}
      </div>

      {stockData.note && (
        <p className="text-xs text-gray-400 italic">
          ℹ️ {stockData.note}
        </p>
      )}
    </div>
  );
};

export default StockPriceWidget;

