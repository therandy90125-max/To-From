import React, { useState, useEffect } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { getCurrencySymbol, getCurrencyCode } from '../utils/currencyUtils';
import StockSearchInput from './StockSearchInput';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'];

const Dashboard = () => {
  const { t, language } = useLanguage();
  const currencySymbol = getCurrencySymbol(language);
  const currencyCode = getCurrencyCode(language);
  
  // Portfolio state - User's current holdings
  const [portfolio, setPortfolio] = useState([
    { ticker: '005930.KS', name: 'Samsung Electronics', shares: 10, avgPrice: 70000, exchange: 'KRX' },
    { ticker: '000270.KS', name: 'Kia Corporation', shares: 15, avgPrice: 95000, exchange: 'KRX' },
    { ticker: '005380.KS', name: 'Hyundai Motor', shares: 5, avgPrice: 220000, exchange: 'KRX' },
  ]);

  const [currentPrices, setCurrentPrices] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showAddStock, setShowAddStock] = useState(false);

  // Calculate portfolio metrics
  useEffect(() => {
    let cost = 0;
    let value = 0;
    
    portfolio.forEach(stock => {
      cost += stock.shares * stock.avgPrice;
      const currentPrice = currentPrices[stock.ticker] || stock.avgPrice;
      value += stock.shares * currentPrice;
    });
    
    setTotalCost(cost);
    setTotalValue(value);
  }, [portfolio, currentPrices]);

  // Add new stock to portfolio
  const handleAddStock = (stock) => {
    const exists = portfolio.some(s => s.ticker === stock.ticker || s.ticker === stock.symbol);
    if (!exists) {
      setPortfolio([...portfolio, {
        ticker: stock.ticker || stock.symbol,
        name: stock.name,
        shares: 0,
        avgPrice: 0,
        exchange: stock.exchange || 'NASDAQ'
      }]);
      setShowAddStock(false);
    }
  };

  // Update stock data
  const updateStock = (index, field, value) => {
    const newPortfolio = [...portfolio];
    newPortfolio[index][field] = parseFloat(value) || 0;
    setPortfolio(newPortfolio);
  };

  // Remove stock from portfolio
  const removeStock = (index) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    setPortfolio(newPortfolio);
  };

  // Update current price from StockPriceWidget callback
  const handlePriceUpdate = (ticker, price) => {
    setCurrentPrices(prev => ({ ...prev, [ticker]: price }));
  };

  // Calculate portfolio distribution for pie chart
  const portfolioDistribution = portfolio
    .filter(stock => stock.shares > 0)
    .map(stock => {
      const currentPrice = currentPrices[stock.ticker] || stock.avgPrice;
      const value = stock.shares * currentPrice;
      return {
        name: stock.name.split(' ')[0], // 짧은 이름
        ticker: stock.ticker,
        value: value,
        percentage: (value / totalValue) * 100
      };
    });

  const totalReturn = totalValue - totalCost;
  const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  // Navigate to optimizer page
  const handleOptimize = () => {
    // Save portfolio to localStorage for optimizer to use
    localStorage.setItem('currentPortfolio', JSON.stringify({
      portfolio,
      totalValue,
      totalCost,
      timestamp: new Date().toISOString()
    }));
    
    // Navigate to optimizer page using custom event
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: { page: 'optimizer' } }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 {t('dashboard')}
          </h1>
          <p className="text-gray-600">
            {t('portfolioOverview')}
          </p>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Value */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">{t('totalPortfolioValue')}</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {currencySymbol}{totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">{currencyCode}</div>
          </div>

          {/* Total Return */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${totalReturn >= 0 ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">{t('totalReturn')}</span>
              <span className="text-2xl">{totalReturn >= 0 ? '📈' : '📉'}</span>
            </div>
            <div className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalReturn >= 0 ? '+' : ''}{currencySymbol}{totalReturn.toLocaleString()}
            </div>
            <div className={`text-sm mt-1 ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
            </div>
          </div>

          {/* Number of Holdings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">{t('holdings')}</span>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {portfolio.filter(s => s.shares > 0).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">{t('stocks')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Portfolio Holdings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📋 {t('currentHoldings')}
              </h2>
              <button
                onClick={() => setShowAddStock(!showAddStock)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                + {t('addStock')}
              </button>
            </div>

            {/* Add Stock Search */}
            {showAddStock && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <StockSearchInput onSelectStock={handleAddStock} />
              </div>
            )}

            {/* Holdings Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('stock')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('shares')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('avgPrice')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('value')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolio.map((stock, index) => {
                    const currentPrice = currentPrices[stock.ticker] || stock.avgPrice;
                    const value = stock.shares * currentPrice;
                    const pl = stock.shares * (currentPrice - stock.avgPrice);
                    const plPercent = stock.avgPrice > 0 ? ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100 : 0;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{stock.ticker}</span>
                            <span className="text-xs text-gray-500">{stock.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="number"
                            value={stock.shares}
                            onChange={(e) => updateStock(index, 'shares', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="number"
                            value={stock.avgPrice}
                            onChange={(e) => updateStock(index, 'avgPrice', e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-gray-900">
                              {currencySymbol}{value.toLocaleString()}
                            </span>
                            <span className={`text-xs ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pl >= 0 ? '+' : ''}{currencySymbol}{pl.toLocaleString()} ({plPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => removeStock(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {portfolio.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📂</div>
                  <p>{t('noStocks')}</p>
                  <p className="text-sm">{t('addStocksToStart')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Portfolio Distribution */}
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🥧 {t('portfolioDistribution')}
              </h2>
              
              {portfolioDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={portfolioDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {portfolioDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${currencySymbol}${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="mt-4 space-y-2">
                    {portfolioDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.ticker}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <p>{t('addStocksToSeeDistribution')}</p>
                </div>
              )}
            </div>

            {/* Optimize Button */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">
                🚀 {t('readyToOptimize')}
              </h3>
              <p className="text-indigo-100 text-sm mb-4">
                {t('optimizePortfolioDesc')}
              </p>
              <button
                onClick={handleOptimize}
                disabled={portfolio.filter(s => s.shares > 0).length < 2}
                className="w-full bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('optimizeMyPortfolio')} →
              </button>
              {portfolio.filter(s => s.shares > 0).length < 2 && (
                <p className="text-xs text-indigo-200 mt-2 text-center">
                  {t('needAtLeast2Stocks')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
