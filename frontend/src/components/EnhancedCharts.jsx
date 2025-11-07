import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const EnhancedCharts = () => {
  const { language } = useLanguage();
  const [optimizationData, setOptimizationData] = useState(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Load last optimization result from localStorage
    const savedData = localStorage.getItem('lastOptimizationResult');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
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

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // No data state
  if (!hasData || !optimizationData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Portfolio Analytics
          </h1>
          <p className="text-gray-600 mb-8">
            {language === 'ko' 
              ? '최적화 결과 비교 및 분석' 
              : 'Optimization Results Comparison & Analysis'}
          </p>

          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('noOptimizationData')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('pleaseRunOptimization')}
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '';
                window.dispatchEvent(new HashChangeEvent('hashchange'));
              }}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {language === 'ko' ? '최적화 페이지로 이동 →' : 'Go to Optimizer →'}
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const { result, input, method, timestamp } = optimizationData;

  // Prepare data for charts
  const weightsComparisonData = result.selected_tickers.map((ticker, index) => ({
    name: ticker,
    original: input?.initialWeights ? input.initialWeights[index] * 100 : 0,
    optimized: result.weights[index] * 100,
  }));

  const pieData = result.selected_tickers.map((ticker, index) => ({
    name: ticker,
    value: result.weights[index] * 100,
  }));

  const metricsData = [
    { 
      metric: language === 'ko' ? '기대 수익률' : 'Expected Return', 
      value: result.expected_return * 100,
      fullMark: 30 
    },
    { 
      metric: language === 'ko' ? '리스크' : 'Risk', 
      value: result.risk * 100,
      fullMark: 30 
    },
    { 
      metric: language === 'ko' ? '샤프 비율' : 'Sharpe Ratio', 
      value: result.sharpe_ratio,
      fullMark: 3 
    },
  ];

  const currency = language === 'ko' ? 'KRW' : 'USD';
  const currencySymbol = language === 'ko' ? '₩' : '$';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 {t('portfolioAnalytics')}
        </h1>
        <p className="text-gray-600">
          {t('methodUsed')}: {method === 'quantum' ? t('quantumOptimization') : t('classicalOptimization')} | {t('executedAt')}: {new Date(timestamp).toLocaleString()}
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold opacity-90">
              {t('expectedReturnAnnual')}
            </span>
            <span className="text-3xl">📈</span>
          </div>
          <div className="text-3xl font-bold">
            +{(result.expected_return * 100).toFixed(2)}%
          </div>
          <div className="text-sm opacity-75 mt-1">
            {t('annualExpected')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold opacity-90">
              {t('portfolioRisk')}
            </span>
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="text-3xl font-bold">
            {(result.risk * 100).toFixed(2)}%
          </div>
          <div className="text-sm opacity-75 mt-1">
            {t('volatility')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold opacity-90">
              {t('sharpeRatioLabel')}
            </span>
            <span className="text-3xl">🎯</span>
          </div>
          <div className="text-3xl font-bold">
            {result.sharpe_ratio.toFixed(2)}
          </div>
          <div className="text-sm opacity-75 mt-1">
            {result.sharpe_ratio > 1.5 
              ? t('excellent')
              : result.sharpe_ratio > 1 
                ? t('good')
                : t('average')}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original vs Optimized Weights Comparison */}
        {input?.initialWeights && (
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🎯 {t('originalVsOptimized')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weightsComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="original"
                  fill="#9ca3af"
                  name={t('originalWeight')}
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="optimized"
                  fill="#3b82f6"
                  name={t('optimizedWeight')}
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationBegin={500}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Risk Metrics Radar */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📊 {t('riskMetricsAnalysis')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={metricsData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar
                name="Metrics"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                animationDuration={1500}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
            {metricsData.map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-gray-600">{metric.metric}</span>
                <span className="font-semibold text-gray-800">
                  {metric.value.toFixed(2)}
                  {metric.metric.includes(language === 'ko' ? '수익률' : 'Return') || metric.metric.includes(language === 'ko' ? '리스크' : 'Risk') ? '%' : ''}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Portfolio Distribution Pie Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🥧 {t('optimizedDistribution')}
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width="100%" height={350} className="md:w-1/2">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:w-1/2">
              {pieData.map((stock, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                  className="p-3 rounded-lg text-center border-2"
                  style={{ 
                    backgroundColor: `${COLORS[index % COLORS.length]}15`,
                    borderColor: COLORS[index % COLORS.length]
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="text-sm font-semibold text-gray-800">{stock.name}</div>
                  <div className="text-2xl font-bold text-gray-900 my-1">
                    {stock.value.toFixed(1)}%
                  </div>
                  {input?.initialWeights && (
                    <div className="text-xs text-gray-500">
                      {stock.value > input.initialWeights[index] * 100 ? '↑' : '↓'}{' '}
                      {Math.abs(stock.value - input.initialWeights[index] * 100).toFixed(1)}%
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedCharts;
