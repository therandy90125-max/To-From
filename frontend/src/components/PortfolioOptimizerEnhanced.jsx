import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrencySymbol, getCurrencyCode } from '../utils/currencyUtils';
import { apiClient, API_ENDPOINTS, checkBackendHealth } from '../config/api';
import LanguageSwitcher from './LanguageSwitcher';
import StockSearchInput from './StockSearchInput';
import StockPriceWidget from './StockPriceWidget';
import CurrencyDisplay from './CurrencyDisplay';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = {
  original: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
  optimized: ['#00B894', '#6C5CE7', '#FDCB6E', '#E17055', '#74B9FF'],
};

// Risk Tolerance 옵션
const RISK_OPTIONS = [
  { value: 0.2, label: 'Conservative', description: 'Low risk, stable returns' },
  { value: 0.5, label: 'Medium - Balanced', description: 'Balanced risk and return' },
  { value: 0.8, label: 'Aggressive', description: 'High risk, high return potential' },
];

export default function PortfolioOptimizerEnhanced() {
  const { t, language } = useLanguage();
  const currencySymbol = getCurrencySymbol(language);
  const currencyCode = getCurrencyCode(language);

  // 입력 상태 (Lovable 스타일)
  const [tickers, setTickers] = useState('AAPL, GOOGL, MSFT');
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [riskTolerance, setRiskTolerance] = useState(0.5); // Medium - Balanced
  const [selectedStocks, setSelectedStocks] = useState([]); // 검색으로 추가된 주식들

  // Dashboard에서 불러온 포트폴리오 (기존 포트폴리오)
  const [originalPortfolio, setOriginalPortfolio] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [useDashboardPortfolio, setUseDashboardPortfolio] = useState(true); // 기본값 true

  // 최적화 설정
  const [period, setPeriod] = useState('1y');

  // 결과 상태 (양자 최적화만)
  const [quantumResult, setQuantumResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // 백엔드 연결 확인
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        setBackendConnected(isHealthy);
        if (!isHealthy) {
          setError(
            language === 'ko'
              ? '⚠️ 백엔드 서버에 연결할 수 없습니다.'
              : '⚠️ Cannot connect to backend server.'
          );
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Backend connection check error:', err);
        setBackendConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [language]);

  // Dashboard 포트폴리오 불러오기 (기존 포트폴리오)
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('currentPortfolio');
    if (savedPortfolio) {
      try {
        const data = JSON.parse(savedPortfolio);
        if (data.portfolio && data.portfolio.length > 0) {
          const filteredPortfolio = data.portfolio.filter(s => s.shares > 0);
          setOriginalPortfolio(filteredPortfolio);
          setPortfolioValue(data.totalValue || 0);
          
          // 티커 자동 설정
          if (useDashboardPortfolio && filteredPortfolio.length > 0) {
            const tickerList = filteredPortfolio.map(s => s.ticker).join(', ');
            setTickers(tickerList);
            if (data.totalValue > 0) {
              setInvestmentAmount(Math.round(data.totalValue));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load portfolio:', e);
      }
    }
  }, [useDashboardPortfolio]);

  // 주식 검색으로 추가
  const handleAddStock = (stock) => {
    const ticker = stock.ticker || stock.symbol;
    if (!tickers.includes(ticker)) {
      setTickers(prev => prev ? `${prev}, ${ticker}` : ticker);
    }
    setSelectedStocks(prev => {
      if (!prev.find(s => (s.ticker || s.symbol) === ticker)) {
        return [...prev, stock];
      }
      return prev;
    });
  };

  // 티커 파싱
  const parseTickers = () => {
    return tickers
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  };

  // 양자 최적화 실행 (기존 포트폴리오 vs 양자 최적화)
  const runOptimization = async () => {
    // Dashboard 포트폴리오 사용 시
    let tickerArray = [];
    let initialWeights = [];
    
    if (useDashboardPortfolio && originalPortfolio && originalPortfolio.length >= 2) {
      tickerArray = originalPortfolio.map(s => s.ticker);
      const totalShares = originalPortfolio.reduce((sum, s) => sum + s.shares, 0);
      if (totalShares === 0) {
        setError(language === 'ko' ? '주식 수량이 0입니다. 포트폴리오를 확인하세요.' : 'Total shares is 0. Please check your portfolio.');
        return;
      }
      initialWeights = originalPortfolio.map(s => s.shares / totalShares);
    } else {
      tickerArray = parseTickers();
      if (tickerArray.length < 2) {
        setError(language === 'ko' ? '최소 2개 이상의 주식을 입력하세요.' : 'Please enter at least 2 stocks.');
        return;
      }
      // 균등 가중치
      initialWeights = new Array(tickerArray.length).fill(1 / tickerArray.length);
    }

    // ✅ 검증: tickers와 initial_weights 개수 일치 확인
    if (tickerArray.length !== initialWeights.length) {
      console.error('❌ Validation Error:', {
        tickers: tickerArray,
        tickersCount: tickerArray.length,
        initialWeights: initialWeights,
        weightsCount: initialWeights.length
      });
      setError(language === 'ko' 
        ? `오류: 주식 개수(${tickerArray.length})와 가중치 개수(${initialWeights.length})가 일치하지 않습니다.` 
        : `Error: Tickers count (${tickerArray.length}) doesn't match weights count (${initialWeights.length}).`);
      return;
    }

    // ✅ 디버깅: 전송 전 데이터 확인
    console.log('📤 Sending to API:', {
      tickers: tickerArray,
      tickersCount: tickerArray.length,
      initial_weights: initialWeights,
      weightsCount: initialWeights.length
    });

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(API_ENDPOINTS.OPTIMIZE_WITH_WEIGHTS, {
        tickers: tickerArray,
        initial_weights: initialWeights,
        risk_factor: riskTolerance,
        method: 'quantum',
        period: period,
        auto_save: false,
      }, {
        timeout: 120000, // 2분 (양자 최적화는 시간이 걸리지만 너무 길면 문제)
      });

      if (response.data.success) {
        const result = response.data.result;
        const parsedResult = {
          selected_tickers: result.selected_tickers || tickerArray,
          optimized_weights: Array.isArray(result.optimized_weights)
            ? result.optimized_weights
            : (typeof result.optimized_weights === 'string'
                ? result.optimized_weights.split(' ').map(Number)
                : result.weights || initialWeights),
          optimized_metrics: result.optimized_metrics || result.optimized || {
            expected_return: result.expected_return || 0,
            risk: result.risk || 0,
            sharpe_ratio: result.sharpe_ratio || 0,
          },
          original_metrics: result.original_metrics || result.original || {
            expected_return: 0,
            risk: 0,
            sharpe_ratio: 0,
          },
          improvement: result.improvement || result.improvements || {
            return_improvement: 0,
            risk_change: 0,
            sharpe_improvement: 0,
          },
          method: 'quantum',
        };

        setQuantumResult(parsedResult);

        // 결과 저장
        localStorage.setItem('lastOptimizationResult', JSON.stringify({
          original: {
            portfolio: originalPortfolio || tickerArray.map(t => ({ ticker: t })),
            weights: initialWeights,
            tickers: tickerArray,
            expected_return: parsedResult.original_metrics.expected_return || 0,
            risk: parsedResult.original_metrics.risk || 0,
            sharpe_ratio: parsedResult.original_metrics.sharpe_ratio || 0,
          },
          optimized: {
            expected_return: parsedResult.optimized_metrics.expected_return || 0,
            risk: parsedResult.optimized_metrics.risk || 0,
            sharpe_ratio: parsedResult.optimized_metrics.sharpe_ratio || 0,
            weights: parsedResult.optimized_weights,
            selected_tickers: parsedResult.selected_tickers,
          },
          improvement: parsedResult.improvement,
          method: 'quantum',
          investmentAmount,
          timestamp: new Date().toISOString(),
        }));
      } else {
        setError(response.data.error || 'Optimization failed');
      }
    } catch (err) {
      console.error('❌ Optimization error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      // 더 자세한 에러 메시지
      let errorMessage = 'Optimization request failed';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = language === 'ko' 
          ? '요청 시간이 초과되었습니다. 백엔드 서버가 응답하지 않습니다. Flask 서버가 실행 중인지 확인하세요.'
          : 'Request timeout. Backend server is not responding. Please check if Flask server is running.';
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        errorMessage = language === 'ko'
          ? '백엔드 서버에 연결할 수 없습니다. Spring Boot (포트 8080)와 Flask (포트 5000)가 실행 중인지 확인하세요.'
          : 'Cannot connect to backend server. Please check if Spring Boot (port 8080) and Flask (port 5000) are running.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Risk Tolerance 드롭다운 값 찾기
  const getRiskOption = (value) => {
    return RISK_OPTIONS.find(opt => opt.value === value) || RISK_OPTIONS[1];
  };

  const currentRiskOption = getRiskOption(riskTolerance);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold">
                  {language === 'ko' ? '포트폴리오 최적화' : 'Portfolio Optimizer'}
                </h1>
              </div>
              <p className="text-gray-400 text-lg">
                {language === 'ko'
                  ? 'AI 기반 주식 포트폴리오 최적화'
                  : 'AI-powered stock portfolio optimization'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  backendConnected
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}
              >
                {backendConnected
                  ? (language === 'ko' ? '✅ 백엔드 연결됨' : '✅ Backend Connected')
                  : (language === 'ko' ? '❌ 백엔드 연결 안됨' : '❌ Backend Disconnected')}
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Form (Lovable Style) */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-green-400">
              {language === 'ko' ? '📊 포트폴리오 설정' : '📊 Portfolio Settings'}
            </h2>

            {/* Dashboard Portfolio Toggle */}
            {dashboardPortfolio && (
              <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDashboardPortfolio}
                    onChange={(e) => setUseDashboardPortfolio(e.target.checked)}
                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                  />
                  <div>
                    <div className="font-semibold">
                      {language === 'ko' ? 'Dashboard 포트폴리오 사용' : 'Use Dashboard Portfolio'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {dashboardPortfolio.portfolio.length} {language === 'ko' ? '개 주식' : 'stocks'}
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Stock Tickers Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {language === 'ko' ? '주식 티커' : 'Stock Tickers'}
              </label>
              <input
                type="text"
                value={tickers}
                onChange={(e) => setTickers(e.target.value)}
                placeholder="AAPL, GOOGL, MSFT, BTC-USD, 005930.KS"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={useDashboardPortfolio}
              />
              <p className="mt-2 text-xs text-gray-400">
                {language === 'ko'
                  ? '쉼표로 구분된 주식 티커 입력 (미국 주식, 암호화폐는 -USD 접미사, 한국 주식은 .KS 접미사)'
                  : 'Enter stock tickers separated by commas (US stocks, crypto with -USD suffix, Korean stocks with .KS suffix)'}
              </p>

              {/* Stock Search (기존 기능) */}
              <div className="mt-4">
                <StockSearchInput
                  onSelectStock={handleAddStock}
                  placeholder={language === 'ko' ? '주식 검색...' : 'Search stocks...'}
                />
              </div>

              {/* Selected Stocks Preview */}
              {selectedStocks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedStocks.map((stock, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold">{stock.ticker || stock.symbol}</span>
                        <span className="text-sm text-gray-400">{stock.name}</span>
                      </div>
                      <StockPriceWidget
                        symbol={stock.ticker || stock.symbol}
                        showDetails={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Investment Amount (Lovable Feature) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {language === 'ko' ? '투자 금액' : 'Investment Amount'} ({currencyCode})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {currencySymbol}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                <CurrencyDisplay
                  amount={investmentAmount}
                  currency={currencyCode}
                  showConversion={true}
                />
              </div>
            </div>

            {/* Risk Tolerance Dropdown (Lovable Style) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {language === 'ko' ? '위험 허용도' : 'Risk Tolerance'}
              </label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {RISK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              <div className="mt-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="text-sm font-semibold text-green-400">{currentRiskOption.label}</div>
                <div className="text-xs text-gray-400 mt-1">{currentRiskOption.description}</div>
              </div>
            </div>

            {/* Data Period */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {language === 'ko' ? '데이터 기간' : 'Data Period'}
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="1mo">{language === 'ko' ? '1개월' : '1 Month'}</option>
                <option value="3mo">{language === 'ko' ? '3개월' : '3 Months'}</option>
                <option value="6mo">{language === 'ko' ? '6개월' : '6 Months'}</option>
                <option value="1y">{language === 'ko' ? '1년' : '1 Year'}</option>
              </select>
            </div>

            {/* Action Button */}
            <div className="space-y-3">
              <button
                onClick={runOptimization}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>{language === 'ko' ? '양자 최적화 중... (최대 2분 소요)' : 'Quantum Optimizing... (up to 2 min)'}</span>
                  </span>
                ) : (
                  <span>{language === 'ko' ? '🔬 양자 포트폴리오 최적화' : '🔬 Quantum Portfolio Optimization'}</span>
                )}
              </button>
              {loading && (
                <div className="mt-2 text-xs text-gray-400 text-center">
                  {language === 'ko' 
                    ? '백엔드 서버가 응답하지 않으면 2분 후 자동으로 타임아웃됩니다.'
                    : 'Request will timeout after 2 minutes if backend does not respond.'}
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                <div className="font-semibold">❌ {language === 'ko' ? '오류' : 'Error'}</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            )}
          </div>

          {/* Right Column: Results (기존 포트폴리오 vs 양자 최적화) */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            {!quantumResult ? (
              // 초기 상태 (Lovable Style)
              <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'ko' ? '시작하기' : 'Get Started'}
                </h2>
                <p className="text-gray-400 text-lg max-w-md">
                  {language === 'ko'
                    ? 'Dashboard 포트폴리오를 사용하거나 주식 티커를 입력하여 양자 최적화와 비교해보세요.'
                    : 'Use your Dashboard portfolio or enter stock tickers to compare with quantum optimization.'}
                </p>
              </div>
            ) : (
              // 기존 포트폴리오 vs 양자 최적화 비교
              <OriginalVsQuantumComparison
                originalPortfolio={originalPortfolio}
                quantumResult={quantumResult}
                investmentAmount={investmentAmount}
                currencyCode={currencyCode}
                language={language}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Optimization Result Card Component
function OptimizationResultCard({ result, title, color, investmentAmount, currencyCode, language }) {
  const metrics = result.optimized_metrics || {};
  const colors = color === 'green' ? COLORS.optimized : COLORS.original;

  // Prepare pie chart data
  const pieData = result.selected_tickers?.map((ticker, idx) => ({
    name: ticker.split('.')[0],
    ticker,
    value: (result.optimized_weights?.[idx] || 0) * 100,
  })) || [];

  // Calculate portfolio value per stock
  const stockAllocations = result.selected_tickers?.map((ticker, idx) => ({
    ticker,
    weight: result.optimized_weights?.[idx] || 0,
    amount: (result.optimized_weights?.[idx] || 0) * investmentAmount,
  })) || [];

  return (
    <div className={`bg-gray-700/30 rounded-xl p-6 border-l-4 ${
      color === 'green' ? 'border-green-500' : 'border-blue-500'
    }`}>
      <h3 className="text-2xl font-bold mb-6">{title}</h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard
          label={language === 'ko' ? '예상 수익률' : 'Expected Return'}
          value={(metrics.expected_return || 0) * 100}
          format={(v) => `${v.toFixed(2)}%`}
          color={color}
        />
        <MetricCard
          label={language === 'ko' ? '위험도' : 'Risk'}
          value={(metrics.risk || 0) * 100}
          format={(v) => `${v.toFixed(2)}%`}
          color={color}
        />
        <MetricCard
          label={language === 'ko' ? '샤프 비율' : 'Sharpe Ratio'}
          value={metrics.sharpe_ratio || 0}
          format={(v) => v.toFixed(3)}
          color={color}
        />
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">
            {language === 'ko' ? '최적화된 비중' : 'Optimized Weights'}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}\n${value.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stock Allocations */}
      {stockAllocations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4">
            {language === 'ko' ? '주식별 배분' : 'Stock Allocations'}
          </h4>
          <div className="space-y-2">
            {stockAllocations.map((stock, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="font-mono font-bold">{stock.ticker}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{(stock.weight * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">
                    <CurrencyDisplay
                      amount={stock.amount}
                      currency={currencyCode}
                      showConversion={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, format, color }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div className={`text-2xl font-bold ${
        color === 'green' ? 'text-green-400' : 'text-blue-400'
      }`}>
        {format(value)}
      </div>
    </div>
  );
}

// Original Portfolio vs Quantum Optimization Comparison
function OriginalVsQuantumComparison({ originalPortfolio, quantumResult, investmentAmount, currencyCode, language }) {
  // Calculate original portfolio distribution
  const originalDistribution = originalPortfolio?.map((stock, idx) => {
    const totalShares = originalPortfolio.reduce((sum, s) => sum + s.shares, 0);
    return {
      name: stock.name?.split(' ')[0] || stock.ticker.split('.')[0],
      ticker: stock.ticker,
      value: (stock.shares / totalShares) * 100,
      shares: stock.shares,
    };
  }) || [];

  // Quantum optimized distribution
  const quantumDistribution = quantumResult.selected_tickers?.map((ticker, idx) => ({
    name: ticker.split('.')[0],
    ticker,
    value: (quantumResult.optimized_weights?.[idx] || 0) * 100,
  })) || [];

  // Comparison metrics
  const originalMetrics = quantumResult.original_metrics || {};
  const quantumMetrics = quantumResult.optimized_metrics || {};
  const improvement = quantumResult.improvement || {};

  const comparisonData = [
    {
      name: language === 'ko' ? '예상 수익률' : 'Expected Return',
      original: (originalMetrics.expected_return || 0) * 100,
      quantum: (quantumMetrics.expected_return || 0) * 100,
      improvement: improvement.return_improvement || 0, // 백엔드에서 계산한 값 사용
    },
    {
      name: language === 'ko' ? '위험도' : 'Risk',
      original: (originalMetrics.risk || 0) * 100,
      quantum: (quantumMetrics.risk || 0) * 100,
      improvement: improvement.risk_change || 0, // 백엔드에서 계산한 값 사용
    },
    {
      name: language === 'ko' ? '샤프 비율' : 'Sharpe Ratio',
      original: originalMetrics.sharpe_ratio || 0,
      quantum: quantumMetrics.sharpe_ratio || 0,
      improvement: improvement.sharpe_improvement || 0, // 백엔드에서 계산한 값 사용
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">
          {language === 'ko' ? '📊 기존 포트폴리오 vs 양자 최적화' : '📊 Original vs Quantum Optimization'}
        </h2>
        <p className="text-gray-400">
          {language === 'ko' ? '양자 알고리즘으로 최적화된 포트폴리오와 비교' : 'Compare with quantum-optimized portfolio'}
        </p>
      </div>

      {/* Side-by-side Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Original Portfolio */}
        <div className="bg-gray-700/30 rounded-xl p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold mb-4">
            {language === 'ko' ? '📂 기존 포트폴리오' : '📂 Original Portfolio'}
          </h3>
          {originalDistribution.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={originalDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}\n${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {originalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.original[index % COLORS.original.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quantum Optimized */}
        <div className="bg-gray-700/30 rounded-xl p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold mb-4">
            {language === 'ko' ? '🔬 양자 최적화' : '🔬 Quantum Optimized'}
          </h3>
          {quantumDistribution.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={quantumDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}\n${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quantumDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.optimized[index % COLORS.optimized.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl p-6 border-2 border-green-500/50">
        <h3 className="text-2xl font-bold mb-6">
          {language === 'ko' ? '📈 성과 비교' : '📈 Performance Comparison'}
        </h3>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="original" fill="#FF6B6B" name={language === 'ko' ? '기존' : 'Original'} />
            <Bar dataKey="quantum" fill="#00B894" name={language === 'ko' ? '양자 최적화' : 'Quantum'} />
          </BarChart>
        </ResponsiveContainer>

        {/* Improvement Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {comparisonData.map((metric, idx) => {
            const isReturnOrSharpe = idx === 0 || idx === 2;
            const quantumBetter = isReturnOrSharpe
              ? metric.quantum > metric.original
              : metric.quantum < metric.original;
            // 백엔드에서 계산한 improvement 값 사용 (이미 퍼센트로 계산됨)
            const improvementValue = metric.improvement || 0;

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  quantumBetter
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-gray-500/20 border-gray-500/50'
                }`}
              >
                <div className="text-sm text-gray-400 mb-2">{metric.name}</div>
                <div className="text-lg font-bold">
                  {quantumBetter ? '✅ 개선됨' : '➡️ 유사'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {idx === 2 ? (
                    <>
                      {language === 'ko' ? '기존' : 'Original'}: {metric.original.toFixed(3)} → {language === 'ko' ? '양자' : 'Quantum'}: {metric.quantum.toFixed(3)}
                    </>
                  ) : (
                    <>
                      {language === 'ko' ? '기존' : 'Original'}: {metric.original.toFixed(2)}% → {language === 'ko' ? '양자' : 'Quantum'}: {metric.quantum.toFixed(2)}%
                    </>
                  )}
                </div>
                {quantumBetter && (
                  <div className="text-xs text-green-400 mt-1">
                    {improvementValue > 0 ? '+' : ''}{improvementValue.toFixed(2)}% {language === 'ko' ? '개선' : 'improvement'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Comparison View Component (deprecated - kept for reference)
function ComparisonView({ classical, quantum, investmentAmount, currencyCode, language }) {
  const comparisonData = [
    {
      name: language === 'ko' ? '예상 수익률' : 'Expected Return',
      classical: (classical.optimized_metrics?.expected_return || 0) * 100,
      quantum: (quantum.optimized_metrics?.expected_return || 0) * 100,
    },
    {
      name: language === 'ko' ? '위험도' : 'Risk',
      classical: (classical.optimized_metrics?.risk || 0) * 100,
      quantum: (quantum.optimized_metrics?.risk || 0) * 100,
    },
    {
      name: language === 'ko' ? '샤프 비율' : 'Sharpe Ratio',
      classical: classical.optimized_metrics?.sharpe_ratio || 0,
      quantum: quantum.optimized_metrics?.sharpe_ratio || 0,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border-2 border-indigo-500/50">
      <h3 className="text-2xl font-bold mb-6">
        {language === 'ko' ? '🆚 양자 vs 클래식 비교' : '🆚 Quantum vs Classical Comparison'}
      </h3>

      {/* Bar Chart Comparison */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Bar dataKey="classical" fill="#3B82F6" name="Classical" />
          <Bar dataKey="quantum" fill="#00B894" name="Quantum" />
        </BarChart>
      </ResponsiveContainer>

      {/* Winner Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
      {comparisonData.map((metric, idx) => {
        const isReturnOrSharpe = idx === 0 || idx === 2; // Expected Return or Sharpe Ratio
        const quantumWins = isReturnOrSharpe
          ? metric.quantum > metric.classical
          : metric.quantum < metric.classical; // Risk: lower is better
        
        return (
          <div
            key={idx}
            className={`p-4 rounded-lg border-2 ${
              quantumWins
                ? 'bg-green-500/20 border-green-500/50'
                : 'bg-blue-500/20 border-blue-500/50'
            }`}
          >
            <div className="text-sm text-gray-400 mb-2">{metric.name}</div>
            <div className="text-lg font-bold">
              {quantumWins ? '🔬 Quantum' : '⚡ Classical'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {idx === 2 ? (
                <>
                  Quantum: {metric.quantum.toFixed(3)} vs Classical: {metric.classical.toFixed(3)}
                </>
              ) : (
                <>
                  Quantum: {metric.quantum.toFixed(2)}% vs Classical: {metric.classical.toFixed(2)}%
                </>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

