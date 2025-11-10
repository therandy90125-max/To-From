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
  
  // Safe number formatting function
  const safeFormat = (value, decimals = 2) => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  useEffect(() => {
    // Load last optimization result from localStorage
    const savedData = localStorage.getItem('lastOptimizationResult');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('[EnhancedCharts] 📊 Loaded optimization data from localStorage:', parsed);
        
        // 데이터 구조 검증 및 디버깅
        const originalWeightsSum = parsed.original?.weights?.reduce((sum, w) => sum + w, 0) || 0;
        const optimizedWeightsSum = parsed.optimized?.weights?.reduce((sum, w) => sum + w, 0) || 0;
        
        console.log('[EnhancedCharts] 🔍 Data structure validation:', {
          hasOriginal: !!parsed.original,
          hasOptimized: !!parsed.optimized,
          hasImprovement: !!parsed.improvement,
          originalTickers: parsed.original?.tickers?.length || 0,
          optimizedTickers: (parsed.optimized?.tickers || parsed.optimized?.selected_tickers)?.length || 0,
          originalWeights: parsed.original?.weights?.length || 0,
          optimizedWeights: parsed.optimized?.weights?.length || 0,
          originalWeightsSum: originalWeightsSum.toFixed(4),
          optimizedWeightsSum: optimizedWeightsSum.toFixed(4),
          originalExpectedReturn: parsed.original?.expected_return,
          optimizedExpectedReturn: parsed.optimized?.expected_return,
          originalRisk: parsed.original?.risk,
          optimizedRisk: parsed.optimized?.risk,
          originalSharpe: parsed.original?.sharpe_ratio,
          optimizedSharpe: parsed.optimized?.sharpe_ratio,
          improvement: parsed.improvement
        });
        
        // 데이터 일치성 검증
        if (parsed.original?.tickers?.length !== parsed.original?.weights?.length) {
          console.warn('[EnhancedCharts] ⚠️ Original tickers and weights count mismatch');
        }
        if (parsed.optimized?.tickers?.length !== parsed.optimized?.weights?.length) {
          console.warn('[EnhancedCharts] ⚠️ Optimized tickers and weights count mismatch');
        }
        if (Math.abs(originalWeightsSum - 1.0) > 0.01) {
          console.warn('[EnhancedCharts] ⚠️ Original weights sum is not 1.0:', originalWeightsSum);
        }
        if (Math.abs(optimizedWeightsSum - 1.0) > 0.01) {
          console.warn('[EnhancedCharts] ⚠️ Optimized weights sum is not 1.0:', optimizedWeightsSum);
        }
        
        // 백엔드 계산값과 프론트엔드 표시값 일치성 검증
        if (parsed.improvement) {
          const calculatedReturnImprovement = parsed.original?.expected_return && parsed.optimized?.expected_return
            ? ((parsed.optimized.expected_return - parsed.original.expected_return) / Math.abs(parsed.original.expected_return || 1)) * 100
            : 0;
          const calculatedRiskChange = parsed.original?.risk && parsed.optimized?.risk
            ? ((parsed.optimized.risk - parsed.original.risk) / Math.abs(parsed.original.risk || 1)) * 100
            : 0;
          const calculatedSharpeImprovement = parsed.original?.sharpe_ratio && parsed.optimized?.sharpe_ratio
            ? ((parsed.optimized.sharpe_ratio - parsed.original.sharpe_ratio) / Math.abs(parsed.original.sharpe_ratio || 1)) * 100
            : 0;
          
          console.log('[EnhancedCharts] 📊 Improvement values comparison:', {
            backendReturnImprovement: parsed.improvement.return_improvement,
            calculatedReturnImprovement: calculatedReturnImprovement.toFixed(2),
            backendRiskChange: parsed.improvement.risk_change,
            calculatedRiskChange: calculatedRiskChange.toFixed(2),
            backendSharpeImprovement: parsed.improvement.sharpe_improvement,
            calculatedSharpeImprovement: calculatedSharpeImprovement.toFixed(2)
          });
          
          // 백엔드 값과 계산값이 크게 다르면 경고
          if (Math.abs(parsed.improvement.return_improvement - calculatedReturnImprovement) > 0.1) {
            console.warn('[EnhancedCharts] ⚠️ Return improvement mismatch:', {
              backend: parsed.improvement.return_improvement,
              calculated: calculatedReturnImprovement
            });
          }
        }
        
        setOptimizationData(parsed);
        setHasData(true);
      } catch (e) {
        console.error('[EnhancedCharts] ❌ Failed to parse optimization data:', e);
        setHasData(false);
      }
    } else {
      console.warn('[EnhancedCharts] ⚠️ No optimization data found in localStorage');
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
            onClick={() => window.dispatchEvent(new CustomEvent('navigateTo', { detail: { page: 'optimizer' } }))}
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

  // 백엔드 응답 구조에 맞춰 데이터 추출 (tickers 또는 selected_tickers 모두 지원)
  const optimizedTickers = optimized.tickers || optimized.selected_tickers || [];
  const originalTickers = original.tickers || [];

  // Prepare data for pie charts
  const originalPieData = originalTickers.map((ticker, index) => ({
    name: ticker.split('.')[0], // Remove .KS extension
    ticker,
    value: (original.weights[index] || 0) * 100,
  }));

  const optimizedPieData = optimizedTickers.map((ticker, index) => ({
    name: ticker.split('.')[0],
    ticker,
    value: (optimized.weights[index] || 0) * 100,
  }));

  // Prepare data for bar chart (weight comparison)
  const weightComparisonData = optimizedTickers.map((ticker, index) => {
    const originalIndex = originalTickers.indexOf(ticker);
    return {
      name: ticker.split('.')[0],
      ticker,
      original: originalIndex >= 0 ? (original.weights[originalIndex] * 100) : 0,
      optimized: (optimized.weights[index] || 0) * 100,
    };
  });

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
              +{(safeFormat(optimized.expected_return, 4) * 100).toFixed(2)}%
            </div>
            <div className="text-sm opacity-90">{t('annualExpected')}</div>
            {improvement && !isNaN(improvement.return_improvement) && (
              <div className="mt-3 pt-3 border-t border-green-400">
                <span className="text-xs opacity-75">{t('improvement')}: </span>
                <span className="text-lg font-bold">
                  {safeFormat(improvement.return_improvement, 4) >= 0 ? '+' : ''}{safeFormat(improvement.return_improvement, 4).toFixed(2)}%
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
              {(safeFormat(optimized.risk, 4) * 100).toFixed(2)}%
            </div>
            <div className="text-sm opacity-90">{t('volatility')}</div>
            {improvement && !isNaN(improvement.risk_change) && (
              <div className="mt-3 pt-3 border-t border-orange-400">
                <span className="text-xs opacity-75">{t('change')}: </span>
                <span className={`text-lg font-bold ${safeFormat(improvement.risk_change, 4) <= 0 ? 'text-white' : 'text-orange-200'}`}>
                  {safeFormat(improvement.risk_change, 4) >= 0 ? '+' : ''}{safeFormat(improvement.risk_change, 4).toFixed(2)}%
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
              {safeFormat(optimized.sharpe_ratio, 4).toFixed(3)}
            </div>
            <div className="text-sm opacity-90">
              {safeFormat(optimized.sharpe_ratio, 4) > 1.5 ? t('excellent') : safeFormat(optimized.sharpe_ratio, 4) > 1.0 ? t('good') : t('average')}
            </div>
            {improvement && !isNaN(improvement.sharpe_improvement) && (
              <div className="mt-3 pt-3 border-t border-purple-400">
                <span className="text-xs opacity-75">{t('improvement')}: </span>
                <span className="text-lg font-bold">
                  {safeFormat(improvement.sharpe_improvement, 4) >= 0 ? '+' : ''}{safeFormat(improvement.sharpe_improvement, 4).toFixed(2)}%
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
                  {improvement.return_improvement >= 0 ? '+' : ''}{improvement.return_improvement?.toFixed(2) || '0.00'}%
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-xs text-gray-600 mb-1">{t('riskChange')}</div>
                <div className={`text-lg font-bold ${improvement.risk_change <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {improvement.risk_change >= 0 ? '+' : ''}{improvement.risk_change?.toFixed(2) || '0.00'}%
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-xs text-gray-600 mb-1">{t('sharpeImprovement')}</div>
                <div className="text-lg font-bold text-purple-600">
                  {improvement.sharpe_improvement >= 0 ? '+' : ''}{improvement.sharpe_improvement?.toFixed(2) || '0.00'}%
                </div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-gray-600 mb-1">{t('overallScore')}</div>
                <div className="text-lg font-bold text-indigo-600">
                  {improvement.score_improvement >= 0 ? '+' : ''}{improvement.score_improvement?.toFixed(2) || '0.00'}%
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* 상세 분석 섹션 추가 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 {language === 'ko' ? '상세 분석' : 'Detailed Analysis'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 리스크 분석 */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ⚠️ {language === 'ko' ? '리스크 분석' : 'Risk Analysis'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '포트폴리오 변동성' : 'Portfolio Volatility'}</span>
                  <span className="font-bold text-gray-900">{(optimized.risk * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '최대 낙폭 (Max Drawdown)' : 'Max Drawdown'}</span>
                  <span className="font-bold text-gray-900">
                    {optimized.max_drawdown ? (optimized.max_drawdown * 100).toFixed(2) + '%' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '베타 (시장 대비)' : 'Beta (vs Market)'}</span>
                  <span className="font-bold text-gray-900">
                    {optimized.beta ? optimized.beta.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? 'VaR (95%)' : 'VaR (95%)'}</span>
                  <span className="font-bold text-gray-900">
                    {optimized.var_95 ? (optimized.var_95 * 100).toFixed(2) + '%' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 수익성 분석 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📈 {language === 'ko' ? '수익성 분석' : 'Return Analysis'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '연간 예상 수익률' : 'Annual Expected Return'}</span>
                  <span className="font-bold text-green-700">+{(optimized.expected_return * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? 'Sortino 비율' : 'Sortino Ratio'}</span>
                  <span className="font-bold text-green-700">
                    {optimized.sortino_ratio ? optimized.sortino_ratio.toFixed(3) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '정보 비율 (IR)' : 'Information Ratio'}</span>
                  <span className="font-bold text-green-700">
                    {optimized.information_ratio ? optimized.information_ratio.toFixed(3) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? 'Calmar 비율' : 'Calmar Ratio'}</span>
                  <span className="font-bold text-green-700">
                    {optimized.calmar_ratio ? optimized.calmar_ratio.toFixed(3) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 포트폴리오 구성 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎯 {language === 'ko' ? '포트폴리오 구성' : 'Portfolio Composition'}
              </h3>
              <div className="space-y-2">
                {(optimized.tickers || optimized.selected_tickers || []).map((ticker, index) => (
                  <div key={ticker} className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm font-medium text-gray-700">{ticker.split('.')[0]}</span>
                    <span className="text-sm font-bold text-blue-700">
                      {((optimized.weights[index] || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">{language === 'ko' ? '총 주식 수' : 'Total Stocks'}</span>
                    <span className="text-sm font-bold text-blue-700">
                      {(optimized.tickers || optimized.selected_tickers || []).length} {language === 'ko' ? '개' : 'stocks'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 최적화 정보 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ⚡ {language === 'ko' ? '최적화 정보' : 'Optimization Info'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '최적화 방법' : 'Optimization Method'}</span>
                  <span className="font-bold text-purple-700">
                    {method === 'quantum' ? (language === 'ko' ? 'Qiskit QAOA' : 'Qiskit QAOA') : (language === 'ko' ? '클래식' : 'Classical')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '실행 시간' : 'Execution Time'}</span>
                  <span className="font-bold text-purple-700">
                    {optimizationData.execution_time ? `${optimizationData.execution_time.toFixed(2)}s` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '최적화 점수' : 'Optimization Score'}</span>
                  <span className="font-bold text-purple-700">
                    {optimized.score ? optimized.score.toFixed(3) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ko' ? '수렴 여부' : 'Convergence'}</span>
                  <span className="font-bold text-purple-700">
                    {optimized.converged ? (language === 'ko' ? '✅ 수렴' : '✅ Converged') : (language === 'ko' ? '⚠️ 미수렴' : '⚠️ Not Converged')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 개선 사항 요약 */}
          {improvement && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ✨ {language === 'ko' ? '최적화 개선 사항' : 'Optimization Improvements'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">{language === 'ko' ? '수익률 개선' : 'Return Improvement'}</div>
                  <div className="text-2xl font-bold text-green-600">
                    {improvement.return_improvement >= 0 ? '+' : ''}{improvement.return_improvement?.toFixed(2) || '0.00'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {language === 'ko' ? '기존 대비 증가' : 'vs Original'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">{language === 'ko' ? '리스크 변화' : 'Risk Change'}</div>
                  <div className={`text-2xl font-bold ${improvement.risk_change <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {improvement.risk_change >= 0 ? '+' : ''}{improvement.risk_change?.toFixed(2) || '0.00'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {improvement.risk_change <= 0 
                      ? (language === 'ko' ? '리스크 감소 ✅' : 'Risk Reduced ✅')
                      : (language === 'ko' ? '리스크 증가' : 'Risk Increased')}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">{language === 'ko' ? '샤프 비율 개선' : 'Sharpe Improvement'}</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {improvement.sharpe_improvement >= 0 ? '+' : ''}{improvement.sharpe_improvement?.toFixed(2) || '0.00'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {language === 'ko' ? '위험 대비 수익 개선' : 'Risk-Adjusted Return'}
                  </div>
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
