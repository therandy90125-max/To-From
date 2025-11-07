import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrencySymbol, getCurrencyCode } from '../utils/currencyUtils';

const COLORS_ORIGINAL = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
const COLORS_OPTIMIZED = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF'];

const EnhancedCharts = () => {
  const { t, language } = useLanguage();
  const currencySymbol = getCurrencySymbol(language);
  const currencyCode = getCurrencyCode(language);
  
  const [optimizationData, setOptimizationData] = useState(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Load last optimization result from localStorage
    const savedData = localStorage.getItem('lastOptimizationResult');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('Loaded optimization data:', parsed);
        setOptimizationData(parsed);
        setHasData(true);
      } catch (e) {
        console.error('Failed to parse optimization data:', e);
        setHasData(false);
      }
    } else {
      setHasData(false);
    }
  }, []);

  // No data state
  if (!hasData || !optimizationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 {t('portfolioAnalytics')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('optimizationComparison')}
          </p>

          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('noOptimizationData')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('pleaseRunOptimization')}
            </p>
            <button
              onClick={() => window.location.hash = 'optimizer'}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('goToOptimizer')} →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const { original, optimized, improvement, method, timestamp } = optimizationData;

  // Prepare data for pie charts
  const originalPieData = original.tickers?.map((ticker, index) => ({
    name: ticker.split('.')[0], // Remove .KS extension
    ticker,
    value: (original.weights[index] || 0) * 100,
  })) || [];

  const optimizedPieData = optimized.selected_tickers?.map((ticker, index) => ({
    name: ticker.split('.')[0],
    ticker,
    value: (optimized.weights[index] || 0) * 100,
  })) || [];

  // Prepare data for bar chart (weight comparison)
  const weightComparisonData = optimized.selected_tickers?.map((ticker, index) => {
    const originalIndex = original.tickers?.indexOf(ticker) ?? -1;
    return {
      name: ticker.split('.')[0],
      ticker,
      original: originalIndex >= 0 ? (original.weights[originalIndex] * 100) : 0,
      optimized: (optimized.weights[index] * 100),
    };
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 {t('portfolioAnalytics')}
          </h1>
          <p className="text-gray-600">
            {t('methodUsed')}: <span className="font-semibold text-indigo-600">
              {method === 'quantum' ? t('quantumOptimization') : t('classicalOptimization')}
            </span> | {t('executedAt')}: {new Date(timestamp).toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US')}
          </p>
        </motion.div>

        {/* Performance Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Expected Return Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">{t('expectedReturnAnnual')}</span>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              +{(optimized.expected_return * 100).toFixed(2)}%
            </div>
            <div className="text-sm opacity-90">{t('annualExpected')}</div>
            {improvement && (
              <div className="mt-3 pt-3 border-t border-green-400">
                <span className="text-xs opacity-75">{t('improvement')}: </span>
                <span className="text-lg font-bold">
                  +{(improvement.return_improvement * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Risk Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">{t('portfolioRisk')}</span>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {(optimized.risk * 100).toFixed(2)}%
            </div>
            <div className="text-sm opacity-90">{t('volatility')}</div>
            {improvement && (
              <div className="mt-3 pt-3 border-t border-orange-400">
                <span className="text-xs opacity-75">{t('change')}: </span>
                <span className={`text-lg font-bold ${improvement.risk_change <= 0 ? 'text-white' : 'text-orange-200'}`}>
                  {improvement.risk_change >= 0 ? '+' : ''}{(improvement.risk_change * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Sharpe Ratio Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">{t('sharpeRatio')}</span>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {optimized.sharpe_ratio?.toFixed(3) || '0.000'}
            </div>
            <div className="text-sm opacity-90">
              {optimized.sharpe_ratio > 1.5 ? t('excellent') : optimized.sharpe_ratio > 1.0 ? t('good') : t('average')}
            </div>
            {improvement && (
              <div className="mt-3 pt-3 border-t border-purple-400">
                <span className="text-xs opacity-75">{t('improvement')}: </span>
                <span className="text-lg font-bold">
                  +{improvement.sharpe_improvement?.toFixed(3) || '0.000'}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Portfolio Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔄 {t('originalVsOptimized')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Portfolio */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {t('originalPortfolio')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={originalPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}\n${value.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {originalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_ORIGINAL[index % COLORS_ORIGINAL.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Original Metrics */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{t('expectedReturnLabel')}</span>
                  <span className="font-semibold text-gray-900">{(original.expected_return * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{t('riskLabel')}</span>
                  <span className="font-semibold text-gray-900">{(original.risk * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{t('sharpeRatioLabel')}</span>
                  <span className="font-semibold text-gray-900">{original.sharpe_ratio?.toFixed(3) || '0.000'}</span>
                </div>
              </div>
            </div>

            {/* Optimized Portfolio */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {t('optimizedPortfolio')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={optimizedPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}\n${value.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {optimizedPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_OPTIMIZED[index % COLORS_OPTIMIZED.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Optimized Metrics */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                  <span className="text-sm text-indigo-700">{t('expectedReturnLabel')}</span>
                  <span className="font-bold text-indigo-900">{(optimized.expected_return * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                  <span className="text-sm text-indigo-700">{t('riskLabel')}</span>
                  <span className="font-bold text-indigo-900">{(optimized.risk * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                  <span className="text-sm text-indigo-700">{t('sharpeRatioLabel')}</span>
                  <span className="font-bold text-indigo-900">{optimized.sharpe_ratio?.toFixed(3) || '0.000'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weight Comparison Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📊 {t('weightComparison')}
          </h2>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={weightComparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" style={{ fontSize: 12 }} label={{ value: t('weight') + ' (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => `${value.toFixed(2)}%`}
              />
              <Legend />
              <Bar dataKey="original" fill="#FF6B6B" name={t('originalWeight')} radius={[8, 8, 0, 0]} />
              <Bar dataKey="optimized" fill="#6C5CE7" name={t('optimizedWeight')} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Improvement Summary */}
          {improvement && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xs text-gray-600 mb-1">{t('returnImprovement')}</div>
                <div className="text-lg font-bold text-green-600">
                  +{(improvement.return_improvement * 100).toFixed(2)}%
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-xs text-gray-600 mb-1">{t('riskChange')}</div>
                <div className={`text-lg font-bold ${improvement.risk_change <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {improvement.risk_change >= 0 ? '+' : ''}{(improvement.risk_change * 100).toFixed(2)}%
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-xs text-gray-600 mb-1">{t('sharpeImprovement')}</div>
                <div className="text-lg font-bold text-purple-600">
                  +{improvement.sharpe_improvement?.toFixed(3) || '0.000'}
                </div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-gray-600 mb-1">{t('overallScore')}</div>
                <div className="text-lg font-bold text-indigo-600">
                  +{(improvement.score_improvement * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedCharts;
