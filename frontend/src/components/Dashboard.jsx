import React, { useState } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { useOptimization } from '../hooks/useOptimization';
import { parseTickers, validateTickers, formatPercent } from '../utils/portfolioUtils';
import StockPriceWidget from './StockPriceWidget';
import StockSearchInput from './StockSearchInput';

const Dashboard = () => {
  const { t } = useLanguage();
  
  // Stock management
  const [stocks, setStocks] = useState([
    { 
      ticker: 'AAPL', 
      name: 'Apple Inc.', 
      market: t('foreign'),
      shares: 10 
    },
    { 
      ticker: '005930.KS', 
      name: 'Samsung Electronics', 
      market: t('domestic'),
      shares: 0 
    }
  ]);

  // Optimization settings
  const [riskLevel, setRiskLevel] = useState(5);
  const [optimizationMethod, setOptimizationMethod] = useState('classical');
  const [period, setPeriod] = useState('1y');

  // Use optimization hook
  const { result: results, loading, error, optimizeWithWeights } = useOptimization();

  // Add stock from search
  const handleSelectStock = (stock) => {
    const exists = stocks.some(s => s.ticker === stock.ticker || s.ticker === stock.symbol);
    if (!exists) {
      setStocks([...stocks, {
        ticker: stock.ticker || stock.symbol,
        name: stock.name,
        market: (stock.exchange?.includes('KS') || stock.exchange?.includes('KRX')) ? t('domestic') : t('foreign'),
        shares: 0
      }]);
    }
  };

  // Update shares
  const updateShares = (index, value) => {
    const newStocks = [...stocks];
    newStocks[index].shares = parseInt(value) || 0;
    setStocks(newStocks);
  };

  // Remove stock
  const removeStock = (index) => {
    setStocks(stocks.filter((_, idx) => idx !== index));
  };

  // Handle optimization
  const handleOptimize = async () => {
    // 1. Extract tickers and calculate weights
    const validStocks = stocks.filter(s => s.shares > 0);
    
    if (validStocks.length === 0) {
      alert(t('pleaseEnterShares') || '최소 한 종목의 보유 수량을 입력해주세요.');
      return;
    }

    const tickerArray = validStocks.map(s => s.ticker);
    const totalShares = validStocks.reduce((sum, s) => sum + s.shares, 0);
    const weightArray = validStocks.map(s => s.shares / totalShares);

    // 2. Validate
    const validation = validateTickers(tickerArray);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // 3. Optimize using hook
    const riskFactor = riskLevel / 10; // Convert 1-10 to 0.0-1.0
    await optimizeWithWeights(
      tickerArray,
      weightArray,
      riskFactor,
      optimizationMethod,
      period
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📊 {t('dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('dashboardSubtitle') || 'Qiskit을 활용한 포트폴리오 최적화'}
          </p>
        </div>

        {/* Stock Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('stockSearch')}</h2>
          </div>
          
          <StockSearchInput
            onSelectStock={handleSelectStock}
            placeholder={t('searchStockPlaceholder')}
            className="w-full"
          />
        </div>

        {/* Stock Input Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('stockInput')}</h2>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 mb-3 pb-2 border-b-2 border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 text-sm">
            <div>{t('tickerCode')}</div>
            <div>{t('stockName')}</div>
            <div>{t('currentPrice')}</div>
            <div>{t('holdingShares')}</div>
            <div>{t('delete')}</div>
          </div>
          
          {/* Stock Rows */}
          {stocks.map((stock, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="font-mono font-semibold text-gray-800 dark:text-white">
                {stock.ticker}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                {stock.name}
              </div>
              {/* Real-time Price */}
              <div>
                <StockPriceWidget symbol={stock.ticker} showDetails={false} />
              </div>
              <input 
                type="number" 
                min="0"
                value={stock.shares}
                onChange={(e) => updateShares(idx, e.target.value)}
                placeholder={t('sharesPlaceholder')}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500"
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">{t('searchToAddStocks')}</p>
              <p className="text-sm">{t('searchInBoxAbove')}</p>
            </div>
          )}
        </div>

        {/* Optimization Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            
            {/* Risk Level */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                {t('riskLevel1to10')}: {riskLevel}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={riskLevel}
                onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Optimization Method */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                {t('optimizationMethodLabel')}
              </label>
              <select 
                value={optimizationMethod}
                onChange={(e) => setOptimizationMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500"
              >
                <option value="classical">{t('classicalMethod')}</option>
                <option value="quantum">{t('qaoaMethod')}</option>
              </select>
            </div>

            {/* Period */}
            <div className="col-span-2">
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                {t('dataPeriodLabel')}
              </label>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500"
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">❌ {t('error')}</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {t('optimizationResults')}
            </h2>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('expectedReturnPercent')}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPercent(results.optimized?.expected_return || results.expected_return)}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('riskPercent')}</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatPercent(results.optimized?.risk || results.risk)}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('sharpeRatioLabel')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {((results.optimized?.sharpe_ratio || results.sharpe_ratio) || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Optimized Weights */}
            {(results.optimized || results).weights && (results.optimized || results).tickers && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  {t('optimizedWeights')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(results.optimized || results).tickers.map((ticker, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{ticker}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {formatPercent((results.optimized || results).weights[idx], 1)}
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
