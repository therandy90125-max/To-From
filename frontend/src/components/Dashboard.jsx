import React, { useState, useEffect } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import StockPriceWidget from './StockPriceWidget';
import StockSearchInput from './StockSearchInput';

const Dashboard = () => {
  const { t } = useLanguage();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [stocks, setStocks] = useState([
    { 
      ticker: 'AAPL', 
      name: 'Apple Inc.', 
      market: t('foreign'),
      price: '250,000',
      shares: 10 
    },
    { 
      ticker: '005930.KS', 
      name: 'Samsung Electronics', 
      market: t('domestic'),
      price: '75,000',
      shares: 0 
    }
  ]);
  const [investmentAmount, setInvestmentAmount] = useState(t('autoCalculate'));
  const [riskLevel, setRiskLevel] = useState(5);
  const [optimizationMethod, setOptimizationMethod] = useState('QAOA');
  const [period, setPeriod] = useState('1y');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search stocks with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchStocks(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchStocks = async (query) => {
    try {
      console.log('Searching for:', query);
      const response = await fetch(`http://localhost:8080/api/stocks/search?q=${query}`);
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success && data.results) {
        console.log('Found results:', data.results.length);
        setSearchResults(data.results);
        setShowDropdown(data.results.length > 0);
      } else {
        console.log('No results or failed');
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const addStockFromSearch = (result) => {
    // Check if stock already exists
    const exists = stocks.some(s => s.ticker === result.ticker);
    if (!exists) {
      setStocks([...stocks, {
        ticker: result.ticker,
        name: result.name,
        market: result.exchange.includes('KS') || result.exchange.includes('KRX') ? t('domestic') : t('foreign'),
        price: t('priceChecking'),
        shares: 0
      }]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const updateShares = (index, value) => {
    const newStocks = [...stocks];
    newStocks[index].shares = parseInt(value) || 0;
    setStocks(newStocks);
  };

  const removeStock = (index) => {
    const newStocks = stocks.filter((_, idx) => idx !== index);
    setStocks(newStocks);
  };

  const handleOptimize = async () => {
    // Validate stocks: filter out invalid tickers
    const validStocks = stocks.filter(s => s.ticker && s.ticker.trim() !== '');
    
    if (validStocks.length < 2) {
      alert(t('minimumTwoStocks'));
      return;
    }

    setLoading(true);
    try {
      // Calculate initial weights based on shares
      const totalShares = validStocks.reduce((sum, s) => sum + s.shares, 0);
      const initialWeights = validStocks.map(s => 
        totalShares > 0 ? s.shares / totalShares : 1.0 / validStocks.length
      );

      console.log('Optimization request:', {
        tickers: validStocks.map(s => s.ticker),
        initial_weights: initialWeights,
        period: period,
        risk_factor: riskLevel / 10,
        method: optimizationMethod.toLowerCase() === 'qaoa' ? 'quantum' : 'classical'
      });

      const response = await fetch('http://localhost:8080/api/portfolio/optimize/with-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickers: validStocks.map(s => s.ticker),
          initial_weights: initialWeights,
          period: period,
          risk_factor: riskLevel / 10,
          method: optimizationMethod.toLowerCase() === 'qaoa' ? 'quantum' : 'classical',
          auto_save: false
        })
      });
      
      const data = await response.json();
      console.log('Optimization response:', data);
      
      if (data.success) {
        setResults(data.result.optimized);
        alert(t('optimizationSuccess'));
      } else {
        alert(t('optimizationFailedMsg') + ': ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Optimization error:', error);
      alert(t('optimizationFailedMsg') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Stock Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800">{t('stockSearch')}</h2>
          </div>
          
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchStockPlaceholder')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            
            {/* Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => addStockFromSearch(result)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                  >
                    <span className="font-semibold text-blue-600">{result.ticker}</span>
                    <span className="text-gray-700 ml-2">{result.name}</span>
                    <span className="text-gray-400 ml-2 text-sm">({result.exchange})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stock Input Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-gray-800">{t('stockInput')}</h2>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-3 pb-2 border-b-2 border-gray-200 font-semibold text-gray-700 text-sm">
            <div>{t('tickerCode')}</div>
            <div>{t('stockName')}</div>
            <div>{t('market')}</div>
            <div>{t('currentPrice')}</div>
            <div>{t('holdingShares')}</div>
            <div>{t('delete')}</div>
          </div>
          
          {/* Stock Rows */}
          {stocks.map((stock, idx) => (
            <div key={idx} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100">
              <input 
                value={stock.ticker} 
                readOnly 
                className="p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono font-semibold"
              />
              <input 
                value={stock.name} 
                readOnly 
                className="p-2 bg-gray-50 border border-gray-200 rounded text-sm"
              />
              <select 
                value={stock.market}
                onChange={(e) => {
                  const newStocks = [...stocks];
                  newStocks[idx].market = e.target.value;
                  setStocks(newStocks);
                }}
                className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option>{t('foreign')}</option>
                <option>{t('domestic')}</option>
              </select>
              {/* Real-time Price Widget */}
              <div className="flex items-center">
                <StockPriceWidget symbol={stock.ticker} showDetails={false} />
              </div>
              <input 
                type="number" 
                min="0"
                value={stock.shares}
                onChange={(e) => updateShares(idx, e.target.value)}
                placeholder={t('sharesPlaceholder')}
                className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeStock(idx)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
              >
                {t('delete')}
              </button>
            </div>
          ))}
          
          {stocks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">{t('searchToAddStocks')}</p>
              <p className="text-sm">{t('searchInBoxAbove')}</p>
            </div>
          )}
        </div>

        {/* Optimization Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            
            {/* Investment Amount */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {t('investmentAmountWon')}
              </label>
              <input
                type="text"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder={t('autoCalculate')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Risk Level */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {t('riskLevel1to10')}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={riskLevel}
                onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Optimization Method */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {t('optimizationMethodLabel')}
              </label>
              <select 
                value={optimizationMethod}
                onChange={(e) => setOptimizationMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="QAOA">{t('qaoaMethod')}</option>
                <option value="QMVS">{t('qmvsMethod')}</option>
              </select>
            </div>

            {/* Period */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {t('dataPeriodLabel')}
              </label>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1mo">{t('oneMonthPeriod')}</option>
                <option value="3mo">{t('threeMonthsPeriod')}</option>
                <option value="6mo">{t('sixMonthsPeriod')}</option>
                <option value="1y">{t('oneYearPeriod')}</option>
                <option value="2y">{t('twoYearsPeriod')}</option>
                <option value="5y">{t('fiveYearsPeriod')}</option>
              </select>
            </div>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={loading || stocks.length === 0}
            className={`mt-6 w-full py-3 rounded-lg font-semibold text-white transition ${
              loading || stocks.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? t('optimizing') : t('executeOptimization')}
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('optimizationResults')}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm text-gray-600">{t('expectedReturnPercent')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(results.expected_return * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <p className="text-sm text-gray-600">{t('riskPercent')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {(results.risk * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <p className="text-sm text-gray-600">{t('sharpeRatioLabel')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {results.sharpe_ratio?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>

            {/* Optimized Weights */}
            {results.weights && results.tickers && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('optimizedWeights')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {results.tickers.map((ticker, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                      <span className="font-medium text-gray-700">{ticker}</span>
                      <span className="text-indigo-600 font-semibold">
                        {(results.weights[idx] * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
