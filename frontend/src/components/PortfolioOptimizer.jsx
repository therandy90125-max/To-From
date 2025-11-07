import { useState, useEffect } from "react";
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrencySymbol, getCurrencyCode } from '../utils/currencyUtils';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
  original: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
  optimized: ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF']
};

export default function PortfolioOptimizer() {
  const { t, language } = useLanguage();
  const currencySymbol = getCurrencySymbol(language);
  const currencyCode = getCurrencyCode(language);
  
  // Portfolio from Dashboard
  const [originalPortfolio, setOriginalPortfolio] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  
  // Optimization settings
  const [riskFactor, setRiskFactor] = useState(0.5);
  const [period, setPeriod] = useState('1y');
  
  // Results
  const [classicalResult, setClassicalResult] = useState(null);
  const [quantumResult, setQuantumResult] = useState(null);
  const [loading, setLoading] = useState({ classical: false, quantum: false });
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  // Load portfolio from Dashboard
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('currentPortfolio');
    if (savedPortfolio) {
      try {
        const data = JSON.parse(savedPortfolio);
        setOriginalPortfolio(data.portfolio.filter(s => s.shares > 0));
        setPortfolioValue(data.totalValue);
      } catch (e) {
        console.error('Failed to load portfolio:', e);
      }
    }
  }, []);

  // Run optimization
  const runOptimization = async (method) => {
    if (!originalPortfolio || originalPortfolio.length < 2) {
      setError(t('needAtLeast2Stocks'));
      return;
    }

    setLoading(prev => ({ ...prev, [method]: true }));
    setError(null);

    try {
      // Prepare data
      const tickers = originalPortfolio.map(s => s.ticker);
      const totalShares = originalPortfolio.reduce((sum, s) => sum + s.shares, 0);
      const initialWeights = originalPortfolio.map(s => s.shares / totalShares);

      const response = await axios.post('/api/portfolio/optimize/with-weights', {
        tickers,
        initial_weights: initialWeights,
        risk_factor: riskFactor,
        method,
        period,
        reps: 5,
        auto_save: false
      }, {
        timeout: method === 'quantum' ? 300000 : 60000
      });

      if (response.data.success) {
        const result = response.data.result;
        
        if (method === 'classical') {
          setClassicalResult(result);
        } else {
          setQuantumResult(result);
        }
        
        // Save to localStorage for Analytics
        localStorage.setItem('lastOptimizationResult', JSON.stringify({
          original: {
            portfolio: originalPortfolio,
            weights: initialWeights,
            tickers,
            ...result.original_metrics
          },
          optimized: {
            ...result.optimized_metrics,
            weights: result.optimized_weights,
            selected_tickers: result.selected_tickers
          },
          improvement: result.improvement,
          method,
          timestamp: new Date().toISOString()
        }));
      } else {
        setError(response.data.error || 'Optimization failed');
      }
    } catch (err) {
      console.error('Optimization error:', err);
      setError(err.response?.data?.error || err.message || 'Optimization request failed');
    } finally {
      setLoading(prev => ({ ...prev, [method]: false }));
    }
  };

  // Run both optimizations for comparison
  const runComparison = async () => {
    setShowComparison(true);
    await runOptimization('classical');
    await runOptimization('quantum');
  };

  // Navigate to Analytics
  const goToAnalytics = () => {
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: { page: 'charts' } }));
  };

  // Calculate original portfolio distribution
  const originalDistribution = originalPortfolio?.map((stock, idx) => {
    const totalShares = originalPortfolio.reduce((sum, s) => sum + s.shares, 0);
    return {
      name: stock.name.split(' ')[0],
      ticker: stock.ticker,
      value: (stock.shares / totalShares) * 100,
      shares: stock.shares
    };
  }) || [];

  // No portfolio loaded
  if (!originalPortfolio || originalPortfolio.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('noPortfolioData')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('pleaseCreatePortfolio')}
          </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigateTo', { detail: { page: 'dashboard' } }))}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('goToDashboard')} →
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 {t('portfolioOptimization')}
          </h1>
          <p className="text-gray-600">
            {t('quantumVsClassicalComparison')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Original Portfolio */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📂 {t('originalPortfolio')}
              </h2>

              {/* Original Pie Chart */}
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={originalDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {originalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.original[index % COLORS.original.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Original Holdings List */}
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('currentHoldings')}</h3>
                {originalPortfolio.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS.original[index % COLORS.original.length] }}
                      />
                      <span className="text-sm font-medium">{stock.ticker}</span>
                    </div>
                    <span className="text-sm text-gray-600">{stock.shares} {t('shares')}</span>
                  </div>
                ))}
              </div>

              {/* Optimization Settings */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('optimizationSettings')}</h3>
                
                <div className="mb-4">
                  <label className="text-sm text-gray-600 block mb-2">
                    {t('riskFactor')}: {riskFactor.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={riskFactor}
                    onChange={(e) => setRiskFactor(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{t('aggressive')}</span>
                    <span>{t('conservative')}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-600 block mb-2">{t('dataPeriod')}</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="1mo">{t('oneMonth')}</option>
                    <option value="3mo">{t('threeMonths')}</option>
                    <option value="6mo">{t('sixMonths')}</option>
                    <option value="1y">{t('oneYear')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Optimization Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => runOptimization('classical')}
                  disabled={loading.classical}
                  className="px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.classical ? '⏳ ' + t('optimizing') : '⚡ ' + t('runClassical')}
                </button>
                
                <button
                  onClick={() => runOptimization('quantum')}
                  disabled={loading.quantum}
                  className="px-6 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.quantum ? '⏳ ' + t('optimizing') : '🔬 ' + t('runQuantum')}
                </button>
                
                <button
                  onClick={runComparison}
                  disabled={loading.classical || loading.quantum}
                  className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(loading.classical || loading.quantum) ? '⏳ ' + t('optimizing') : '🆚 ' + t('runComparison')}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
                <h3 className="font-semibold mb-1">❌ {t('error')}</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Classical Result */}
            {classicalResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ⚡ {t('classicalOptimization')} {t('result')}
                </h3>
                <OptimizationResultCard result={classicalResult} currencySymbol={currencySymbol} t={t} color="blue" />
              </div>
            )}

            {/* Quantum Result */}
            {quantumResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🔬 {t('quantumOptimization')} {t('result')}
                </h3>
                <OptimizationResultCard result={quantumResult} currencySymbol={currencySymbol} t={t} color="purple" />
              </div>
            )}

            {/* Comparison View */}
            {classicalResult && quantumResult && showComparison && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  🆚 {t('quantumVsClassical')}
                </h3>
                
                {/* Comparison Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <MetricComparisonCard
                    title={t('expectedReturnLabel')}
                    classical={classicalResult.optimized_metrics.expected_return * 100}
                    quantum={quantumResult.optimized_metrics.expected_return * 100}
                    format={(v) => `${v.toFixed(2)}%`}
                    higherIsBetter={true}
                  />
                  <MetricComparisonCard
                    title={t('riskLabel')}
                    classical={classicalResult.optimized_metrics.risk * 100}
                    quantum={quantumResult.optimized_metrics.risk * 100}
                    format={(v) => `${v.toFixed(2)}%`}
                    higherIsBetter={false}
                  />
                  <MetricComparisonCard
                    title={t('sharpeRatioLabel')}
                    classical={classicalResult.optimized_metrics.sharpe_ratio}
                    quantum={quantumResult.optimized_metrics.sharpe_ratio}
                    format={(v) => v.toFixed(3)}
                    higherIsBetter={true}
                  />
                </div>

                {/* View Detailed Analytics Button */}
                <button
                  onClick={goToAnalytics}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-colors"
                >
                  📊 {t('viewDetailedAnalytics')} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Optimization Result Card Component
function OptimizationResultCard({ result, currencySymbol, t, color }) {
  const metrics = result.optimized_metrics;
  const improvement = result.improvement;

  return (
    <div>
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{t('expectedReturnLabel')}</div>
          <div className="text-lg font-bold text-gray-900">{(metrics.expected_return * 100).toFixed(2)}%</div>
          {improvement && (
            <div className={`text-xs ${improvement.return_improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement.return_improvement >= 0 ? '+' : ''}{(improvement.return_improvement * 100).toFixed(2)}%
            </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{t('riskLabel')}</div>
          <div className="text-lg font-bold text-gray-900">{(metrics.risk * 100).toFixed(2)}%</div>
          {improvement && (
            <div className={`text-xs ${improvement.risk_change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement.risk_change >= 0 ? '+' : ''}{(improvement.risk_change * 100).toFixed(2)}%
            </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{t('sharpeRatioLabel')}</div>
          <div className="text-lg font-bold text-gray-900">{metrics.sharpe_ratio.toFixed(3)}</div>
          {improvement && (
            <div className={`text-xs ${improvement.sharpe_improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement.sharpe_improvement >= 0 ? '+' : ''}{improvement.sharpe_improvement.toFixed(3)}
            </div>
          )}
        </div>
      </div>

      {/* Selected Stocks */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('optimizedWeights')}</h4>
        <div className="space-y-2">
          {result.selected_tickers.map((ticker, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">{ticker}</span>
              <span className="text-sm font-bold" style={{ color: color === 'blue' ? '#3B82F6' : '#A855F7' }}>
                {(result.optimized_weights[idx] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Metric Comparison Card Component
function MetricComparisonCard({ title, classical, quantum, format, higherIsBetter }) {
  const winner = higherIsBetter ? (quantum > classical ? 'quantum' : 'classical') : (quantum < classical ? 'quantum' : 'classical');
  
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="text-xs text-gray-600 mb-2">{title}</div>
      <div className="space-y-2">
        <div className={`flex items-center justify-between p-2 rounded ${winner === 'classical' ? 'bg-blue-100' : 'bg-gray-50'}`}>
          <span className="text-xs font-medium text-gray-700">Classical</span>
          <span className="text-sm font-bold text-blue-600">{format(classical)}</span>
        </div>
        <div className={`flex items-center justify-between p-2 rounded ${winner === 'quantum' ? 'bg-purple-100' : 'bg-gray-50'}`}>
          <span className="text-xs font-medium text-gray-700">Quantum</span>
          <span className="text-sm font-bold text-purple-600">{format(quantum)}</span>
        </div>
      </div>
      {winner === 'quantum' && (
        <div className="mt-2 text-center">
          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
            ⭐ Quantum Wins
          </span>
        </div>
      )}
    </div>
  );
}
