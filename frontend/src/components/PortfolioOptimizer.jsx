import { useState, useEffect, useMemo } from "react";
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrencySymbol, getCurrencyCode } from '../utils/currencyUtils';
import { checkBackendHealth } from '../config/api';
import { optimizePortfolioWithWeights } from '../api/portfolioApi';
import LanguageSwitcher from './LanguageSwitcher';
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
  const [quantumResult, setQuantumResult] = useState(null);
  const [loading, setLoading] = useState({ quantum: false });
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // Load portfolio from Dashboard
  useEffect(() => {
    const loadPortfolio = () => {
      const savedPortfolio = localStorage.getItem('currentPortfolio');
      if (savedPortfolio) {
        try {
          const data = JSON.parse(savedPortfolio);
          const activePortfolio = data.portfolio.filter(s => s.shares > 0);
          
          if (activePortfolio.length >= 2) {
            setOriginalPortfolio(activePortfolio);
            setPortfolioValue(data.totalValue || 0);
            console.log('[PortfolioOptimizer] ✅ Portfolio loaded:', {
              stocks: activePortfolio.length,
              portfolio: activePortfolio
            });
          } else {
            console.warn('[PortfolioOptimizer] ⚠️ Insufficient stocks in portfolio:', activePortfolio.length);
            setError(language === 'ko' 
              ? '최적화를 위해서는 최소 2개 이상의 주식이 필요합니다.'
              : 'At least 2 stocks are required for optimization.'
            );
          }
        } catch (e) {
          console.error('[PortfolioOptimizer] ❌ Failed to load portfolio:', e);
          setError(language === 'ko'
            ? '포트폴리오 데이터를 불러오는 중 오류가 발생했습니다.'
            : 'Error loading portfolio data.'
          );
        }
      } else {
        console.warn('[PortfolioOptimizer] ⚠️ No portfolio data found in localStorage');
      }
    };
    
    loadPortfolio();
    
    // Listen for portfolio updates from Dashboard
    const handleStorageChange = (e) => {
      if (e.key === 'currentPortfolio') {
        console.log('[PortfolioOptimizer] Portfolio updated in localStorage');
        loadPortfolio();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event from same window
    const handlePortfolioUpdate = () => {
      console.log('[PortfolioOptimizer] Portfolio update event received');
      loadPortfolio();
    };
    
    window.addEventListener('portfolioUpdated', handlePortfolioUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolioUpdated', handlePortfolioUpdate);
    };
  }, [language]);

  // 백엔드 연결 확인 (컴포넌트 마운트시)
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        setBackendConnected(isHealthy);
        
        if (!isHealthy) {
          const errorMessage = language === 'ko' 
            ? '⚠️ 백엔드 서버에 연결할 수 없습니다.\n\n해결 방법:\n1. PowerShell에서 .\\start-dev.ps1 실행\n2. 또는 백엔드 디렉토리에서 .\\mvnw.cmd spring-boot:run 실행\n3. 브라우저 콘솔(F12)에서 상세 오류 확인'
            : '⚠️ Cannot connect to backend server.\n\nSolutions:\n1. Run .\\start-dev.ps1 in PowerShell\n2. Or run .\\mvnw.cmd spring-boot:run in backend directory\n3. Check browser console (F12) for detailed errors';
          setError(errorMessage);
          
          // 콘솔에 상세 정보 출력
          console.error('❌ Backend connection failed');
          console.error('📍 Backend URL:', import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080');
          console.error('💡 서버가 실행 중인지 확인하세요.');
        } else {
          // 연결 성공 시 에러 메시지 제거
          setError(null);
        }
      } catch (err) {
        console.error('Backend connection check error:', err);
        setBackendConnected(false);
      }
    };
    
    // 초기 확인
    checkConnection();
    
    // 주기적으로 연결 상태 확인 (30초마다)
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [language]);

  // Run quantum optimization only
  const runOptimization = async () => {
    if (!originalPortfolio || originalPortfolio.length < 2) {
      setError(t('needAtLeast2Stocks'));
      return;
    }

    setLoading(prev => ({ ...prev, quantum: true }));
    setError(null);
    
    // 전역 이벤트 발생: 양자 최적화 시작
    window.dispatchEvent(new CustomEvent('quantumOptimizationStart'));

    try {
      // Prepare data
      const tickers = originalPortfolio.map(s => s.ticker);
      const totalShares = originalPortfolio.reduce((sum, s) => sum + s.shares, 0);
      
      if (totalShares === 0) {
        setError(t('totalSharesZero'));
        setLoading(prev => ({ ...prev, quantum: false }));
        return;
      }
      
      const initialWeights = originalPortfolio.map(s => s.shares / totalShares);

      // ✅ 검증: tickers와 initial_weights 개수 일치 확인
      if (tickers.length !== initialWeights.length) {
        console.error('❌ Validation Error:', {
          tickers,
          tickersCount: tickers.length,
          initialWeights,
          weightsCount: initialWeights.length
        });
        setError(`Error: Tickers count (${tickers.length}) doesn't match weights count (${initialWeights.length}).`);
        setLoading(prev => ({ ...prev, quantum: false }));
        return;
      }

      // ✅ 디버깅: 전송 전 데이터 확인
      console.log('📤 Sending to API:', {
        tickers,
        tickersCount: tickers.length,
        initial_weights: initialWeights,
        weightsCount: initialWeights.length
      });

      // portfolioApi.js의 optimizePortfolioWithWeights 사용 (Flask 직접 호출)
      // ✅ Qiskit QAOA 양자 최적화 강제 실행
      console.log('[PortfolioOptimizer] 🚀 Starting Qiskit QAOA Quantum Optimization...');
      console.log('[PortfolioOptimizer] Method: quantum (Qiskit QAOA)');
      console.log('[PortfolioOptimizer] Tickers:', tickers);
      console.log('[PortfolioOptimizer] Initial weights:', initialWeights);
      
      const response = await optimizePortfolioWithWeights({
        tickers,
        initialWeights: initialWeights,
        riskFactor: riskFactor,
        method: 'quantum',  // ✅ Qiskit QAOA 양자 최적화 강제
        period,
        reps: 1,  // Fast execution (10-15 seconds) - Qiskit QAOA reps
        precision: 4,  // Binary encoding precision for QUBO
        auto_save: false,
        fast_mode: true  // Fast mode for QAOA
      });
      
      console.log('[PortfolioOptimizer] ✅ Qiskit QAOA Optimization completed');

      // Flask 직접 호출은 success 필드가 없을 수 있으므로 result 직접 확인
      const result = response.result || response;
      
      if (response.success !== false && result) {
        
        // Parse result data safely - Backend returns {original: {...}, optimized: {...}, improvements: {...}}
        const originalData = result.original || {};
        const optimizedData = result.optimized || {};
        const improvementsData = result.improvements || {};
        
        // 백엔드 응답 구조: {original: {tickers, weights, ...}, optimized: {tickers, weights, ...}, improvements: {...}}
        const parsedResult = {
          selected_tickers: optimizedData.tickers || result.selected_tickers || tickers,
          optimized_weights: Array.isArray(optimizedData.weights) 
            ? optimizedData.weights 
            : (Array.isArray(result.optimized_weights)
                ? result.optimized_weights
                : (typeof result.optimized_weights === 'string' 
                    ? result.optimized_weights.split(' ').map(Number)
                    : result.weights || initialWeights)),
          optimized_metrics: {
            expected_return: optimizedData.expected_return || result.expected_return || 0,
            risk: optimizedData.risk || result.risk || 0,
            sharpe_ratio: optimizedData.sharpe_ratio || result.sharpe_ratio || 0
          },
          original_metrics: {
            expected_return: originalData.expected_return || 0,
            risk: originalData.risk || 0,
            sharpe_ratio: originalData.sharpe_ratio || 0
          },
          improvement: improvementsData || result.improvement || result.improvements || {
            return_improvement: 0,
            risk_change: 0,
            sharpe_improvement: 0,
            score_improvement: 0
          },
          method: result.method || 'quantum',
          quantum_verified: result.quantum_verified !== false,
          quantum: result.quantum || {}
        };
        
        setQuantumResult(parsedResult);
        
        // Save to localStorage for Analytics - 백엔드 응답 구조와 정확히 일치하도록 저장
        const analyticsData = {
          original: {
            tickers: originalData.tickers || tickers,  // 백엔드에서 반환한 tickers 사용
            weights: originalData.weights || initialWeights,  // 백엔드에서 반환한 weights 사용
            expected_return: originalData.expected_return || parsedResult.original_metrics.expected_return || 0,
            risk: originalData.risk || parsedResult.original_metrics.risk || 0,
            sharpe_ratio: originalData.sharpe_ratio || parsedResult.original_metrics.sharpe_ratio || 0,
            optimization_score: originalData.optimization_score || 0  // 백엔드에서 반환한 score 추가
          },
          optimized: {
            tickers: optimizedData.tickers || parsedResult.selected_tickers || tickers,  // 백엔드에서 반환한 tickers 사용 (selected_tickers 대신)
            weights: optimizedData.weights || parsedResult.optimized_weights,  // 백엔드에서 반환한 weights 사용
            expected_return: optimizedData.expected_return || parsedResult.optimized_metrics.expected_return || 0,
            risk: optimizedData.risk || parsedResult.optimized_metrics.risk || 0,
            sharpe_ratio: optimizedData.sharpe_ratio || parsedResult.optimized_metrics.sharpe_ratio || 0,
            optimization_score: optimizedData.optimization_score || 0  // 백엔드에서 반환한 score 추가
          },
          improvement: parsedResult.improvement,  // improvements가 아닌 improvement로 저장 (Analytics와 일치)
          method: parsedResult.method || 'quantum',
          timestamp: new Date().toISOString()
        };
        
        // 디버깅: 저장되는 데이터 확인
        console.log('[PortfolioOptimizer] 💾 Saving to localStorage for Analytics:', {
          original: {
            tickers: analyticsData.original.tickers,
            weights: analyticsData.original.weights,
            expected_return: analyticsData.original.expected_return,
            risk: analyticsData.original.risk,
            sharpe_ratio: analyticsData.original.sharpe_ratio
          },
          optimized: {
            tickers: analyticsData.optimized.tickers,
            weights: analyticsData.optimized.weights,
            expected_return: analyticsData.optimized.expected_return,
            risk: analyticsData.optimized.risk,
            sharpe_ratio: analyticsData.optimized.sharpe_ratio
          },
          improvement: analyticsData.improvement
        });
        
        localStorage.setItem('lastOptimizationResult', JSON.stringify(analyticsData));
      } else {
        setError(response.error || response.message || 'Optimization failed');
      }
    } catch (err) {
      console.error('Optimization error:', err);
      
      // 더 상세한 에러 메시지
      let errorMessage = 'Optimization request failed';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = language === 'ko' 
          ? '요청 시간 초과: Flask 서버 응답이 너무 느립니다. Flask 서버가 실행 중인지 확인하세요.'
          : 'Request timeout: Flask server response is too slow. Please check if Flask server is running.';
      } else if (err.message?.includes('Network Error') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = language === 'ko'
          ? '네트워크 오류: Flask 서버에 연결할 수 없습니다. Flask 서버가 http://localhost:5000 에서 실행 중인지 확인하세요.'
          : 'Network error: Cannot connect to Flask server. Please check if Flask server is running at http://localhost:5000';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // 콘솔에 상세 정보 출력
      console.error('❌ Optimization failed details:');
      console.error('   Error:', err);
      console.error('   Response:', err.response);
      console.error('   Message:', err.message);
      console.error('💡 Flask 서버 확인: http://localhost:5000/api/health');
    } finally {
      setLoading(prev => ({ ...prev, quantum: false }));
      // 전역 이벤트 발생: 양자 최적화 종료
      window.dispatchEvent(new CustomEvent('quantumOptimizationEnd'));
    }
  };

  // Run quantum optimization only (기존 포트폴리오 vs 양자 최적화)
  const runQuantumOptimization = async () => {
    console.log('[PortfolioOptimizer] runQuantumOptimization called');
    console.log('[PortfolioOptimizer] Original portfolio:', originalPortfolio);
    console.log('[PortfolioOptimizer] Portfolio length:', originalPortfolio?.length);
    
    if (!originalPortfolio || originalPortfolio.length < 2) {
      const errorMsg = language === 'ko' 
        ? '최적화를 위해서는 최소 2개 이상의 주식이 필요합니다.'
        : 'At least 2 stocks are required for optimization.';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }
    
    setShowComparison(true);
    await runOptimization();
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
        {loading.quantum && <OptimizationProgressOverlay language={language} />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🎯 {t('portfolioOptimization')}
              </h1>
              <p className="text-gray-600">
                {language === 'ko' ? '양자 알고리즘으로 포트폴리오를 최적화합니다' : 'Optimize portfolio with quantum algorithm'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 백엔드 상태 표시 */}
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                backendConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {backendConnected 
                  ? (language === 'ko' ? '✅ 백엔드 연결됨' : '✅ Backend Connected')
                  : (language === 'ko' ? '❌ 백엔드 연결 안됨' : '❌ Backend Disconnected')
                }
              </div>
              {/* Language Switcher */}
              <LanguageSwitcher />
            </div>
          </div>
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
            {/* Action Button - 양자 최적화만 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'ko' ? '🔬 Qiskit QAOA 양자 최적화' : '🔬 Qiskit QAOA Quantum Optimization'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'ko' 
                    ? 'Qiskit QAOA 양자 알고리즘으로 포트폴리오를 최적화합니다.'
                    : 'Optimize your portfolio using Qiskit QAOA quantum algorithm.'}
                </p>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('='.repeat(60));
                    console.log('[PortfolioOptimizer] 🚀 Quantum optimization button clicked!');
                    console.log('[PortfolioOptimizer] Loading state:', loading.quantum);
                    console.log('[PortfolioOptimizer] Original portfolio:', originalPortfolio);
                    console.log('[PortfolioOptimizer] Portfolio length:', originalPortfolio?.length);
                    console.log('='.repeat(60));
                    
                    if (loading.quantum) {
                      console.warn('[PortfolioOptimizer] ⚠️ Already optimizing, ignoring click');
                      return;
                    }
                    
                    if (!originalPortfolio || originalPortfolio.length < 2) {
                      const errorMsg = language === 'ko' 
                        ? '최적화를 위해서는 최소 2개 이상의 주식이 필요합니다.'
                        : 'At least 2 stocks are required for optimization.';
                      console.error('[PortfolioOptimizer] ❌ Validation failed:', errorMsg);
                      alert(errorMsg);
                      return;
                    }
                    
                    // Flask 서버 연결 확인
                    const FLASK_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || import.meta.env.VITE_FLASK_URL || 'http://localhost:5000';
                    console.log('[PortfolioOptimizer] Checking Flask server:', FLASK_URL);
                    
                    try {
                      const healthCheck = await fetch(`${FLASK_URL}/api/health`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        signal: AbortSignal.timeout(5000)
                      });
                      
                      if (healthCheck.ok) {
                        console.log('[PortfolioOptimizer] ✅ Flask server is healthy');
                        runQuantumOptimization();
                      } else {
                        throw new Error(`Flask server returned ${healthCheck.status}`);
                      }
                    } catch (flaskError) {
                      console.error('[PortfolioOptimizer] ❌ Flask server check failed:', flaskError);
                      const errorMsg = language === 'ko'
                        ? `Flask 서버에 연결할 수 없습니다.\n\nFlask 서버가 ${FLASK_URL}에서 실행 중인지 확인하세요.\n\n에러: ${flaskError.message}`
                        : `Cannot connect to Flask server.\n\nPlease check if Flask server is running at ${FLASK_URL}.\n\nError: ${flaskError.message}`;
                      setError(errorMsg);
                      alert(errorMsg);
                    }
                  }}
                  disabled={loading.quantum}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    cursor: loading.quantum ? 'not-allowed' : 'pointer',
                    pointerEvents: loading.quantum ? 'none' : 'auto',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  {loading.quantum ? '⏳ ' + (language === 'ko' ? '양자 최적화 실행 중...' : 'Running Quantum Optimization...') : '🚀 ' + (language === 'ko' ? '양자 최적화 실행' : 'Run Quantum Optimization')}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
                <h3 className="font-semibold mb-2">❌ {t('error')}</h3>
                <p className="text-sm whitespace-pre-line">{error}</p>
                <div className="mt-3 text-xs text-red-600">
                  <p className="font-semibold">{language === 'ko' ? '추가 정보:' : 'Additional Info:'}</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>{language === 'ko' ? '브라우저 개발자 도구(F12) → Console 탭에서 상세 오류 확인' : 'Open browser DevTools (F12) → Console tab for detailed errors'}</li>
                    <li>{language === 'ko' ? '백엔드 서버가 http://localhost:8080 에서 실행 중인지 확인' : 'Verify backend server is running at http://localhost:8080'}</li>
                    <li>{language === 'ko' ? '포트 충돌이 있는지 확인 (다른 프로그램이 8080 포트 사용 중일 수 있음)' : 'Check for port conflicts (another program may be using port 8080)'}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 기존 포트폴리오 vs 양자 최적화 비교 */}
            {quantumResult && showComparison && (
              <OriginalVsQuantumView
                originalPortfolio={originalPortfolio}
                quantumResult={quantumResult}
                currencySymbol={currencySymbol}
                t={t}
                language={language}
                goToAnalytics={goToAnalytics}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OptimizationProgressOverlay({ language }) {
  const header = language === 'ko' ? '양자 최적화 실행 중...' : 'Running Quantum Optimization...';
  const subtitle =
    language === 'ko'
      ? '처리중입니다. 잠시만 기다려 주세요.'
      : 'This may take a few seconds. Please be patient.';
  const tips =
    language === 'ko'
      ? ['데이터를 정규화하는 중...', 'QAOA 회로를 탐색하는 중...', '결과를 정밀 검증 중...']
      : ['Normalizing data grid...', 'Exploring QAOA circuit space...', 'Verifying portfolio metrics...'];

  return (
    <div className="optimization-overlay">
      <div className="optimization-overlay-card">
        <div className="quantum-pulse" />
        <h3>{header}</h3>
        <p>{subtitle}</p>
        <ul>
          {tips.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Optimization Result Card Component
function OptimizationResultCard({ result, currencySymbol, t, color }) {
  const metrics = result.optimized_metrics || {};
  const improvement = result.improvement || {};
  const quantumNote = result.quantum?.note;
  const quantumStatus = result.quantum?.status;
  const verified = result.quantum_verified !== false;
  
  // Safe number formatting
  const safeFormat = (value, decimals = 2) => {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  return (
    <div>
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{t('expectedReturnLabel')}</div>
          <div className="text-lg font-bold text-gray-900">{safeFormat((metrics.expected_return || 0) * 100, 2)}%</div>
          {improvement && !isNaN(improvement.return_improvement) && (
            <div className={`text-xs ${improvement.return_improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement.return_improvement >= 0 ? '+' : ''}{safeFormat(improvement.return_improvement, 2)}%
            </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{t('riskLabel')}</div>
          <div className="text-lg font-bold text-gray-900">{safeFormat((metrics.risk || 0) * 100, 2)}%</div>
          {improvement && !isNaN(improvement.risk_change) && (
            <div className={`text-xs ${improvement.risk_change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement.risk_change >= 0 ? '+' : ''}{safeFormat(improvement.risk_change, 2)}%
            </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{t('sharpeRatioLabel')}</div>
          <div className="text-lg font-bold text-gray-900">{safeFormat(metrics.sharpe_ratio || 0, 3)}</div>
          {improvement && !isNaN(improvement.sharpe_improvement) && (
            <div className={`text-xs ${improvement.sharpe_improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement.sharpe_improvement >= 0 ? '+' : ''}{safeFormat(improvement.sharpe_improvement, 3)}
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

// 기존 포트폴리오 vs 양자 최적화 비교 뷰
function OriginalVsQuantumView({ originalPortfolio, quantumResult, currencySymbol, t, language, goToAnalytics }) {
  const quantumVerified = quantumResult.quantum_verified !== false;
  const quantumStatus = quantumResult.quantum?.status || '';
  const quantumNote = quantumResult.quantum?.note || '';

  const tickerNameMap = useMemo(() => {
    const map = {};

    (originalPortfolio || []).forEach((stock) => {
      if (!stock?.ticker) {
        return;
      }
      map[stock.ticker] = stock.name;
      const shortTicker = stock.ticker.split('.')[0];
      map[shortTicker] = stock.name;
    });

    const assetNames = quantumResult?.asset_names || quantumResult?.selected_assets;
    if (Array.isArray(assetNames)) {
      (quantumResult?.selected_tickers || []).forEach((ticker, idx) => {
        if (!ticker) return;
        const name = assetNames[idx];
        if (name) {
          map[ticker] = name;
          map[ticker.split('.')[0]] = name;
        }
      });
    }

    return map;
  }, [originalPortfolio, quantumResult]);

  const getDisplayName = (ticker) => {
    if (!ticker) return '';
    const shortTicker = ticker.split('.')[0];
    const candidate = tickerNameMap[ticker] || tickerNameMap[shortTicker];
    if (!candidate) {
      return shortTicker;
    }
    return candidate.split('(')[0].trim();
  };

  const totalShares = (originalPortfolio || []).reduce((sum, stock) => sum + (stock?.shares || 0), 0);

  const originalDistribution = (originalPortfolio || [])
    .map((stock) => ({
      name: getDisplayName(stock.ticker),
      ticker: stock.ticker,
      value: totalShares > 0 ? (stock.shares / totalShares) * 100 : 0,
      shares: stock.shares,
    }))
    .filter((item) => item.value > 0);

  const quantumDistribution = (quantumResult?.selected_tickers || [])
    .map((ticker, idx) => ({
      name: getDisplayName(ticker),
      ticker,
      value: ((quantumResult?.optimized_weights || [])[idx] || 0) * 100,
    }))
    .filter((item) => item.value > 0);

  // Comparison metrics
  const originalMetrics = quantumResult.original_metrics || {};
  const quantumMetrics = quantumResult.optimized_metrics || {};
  const improvement = quantumResult.improvement || {};

  const comparisonData = [
    {
      name: language === 'ko' ? '예상 수익률' : 'Expected Return',
      original: (originalMetrics.expected_return || 0) * 100,
      quantum: (quantumMetrics.expected_return || 0) * 100,
    },
    {
      name: language === 'ko' ? '위험도' : 'Risk',
      original: (originalMetrics.risk || 0) * 100,
      quantum: (quantumMetrics.risk || 0) * 100,
    },
    {
      name: language === 'ko' ? '샤프 비율' : 'Sharpe Ratio',
      original: originalMetrics.sharpe_ratio || 0,
      quantum: quantumMetrics.sharpe_ratio || 0,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {language === 'ko' ? '📊 기존 포트폴리오 vs 양자 최적화' : '📊 Original vs Quantum Optimization'}
        </h3>
        <p className="text-gray-600 text-center">
          {language === 'ko' ? '양자 알고리즘으로 최적화된 포트폴리오와 비교' : 'Compare with quantum-optimized portfolio'}
        </p>
      </div>

      {/* Side-by-side Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Portfolio */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold mb-4 text-center">
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
                  label={({ name, ticker, value }) => `${name} (${ticker})\n${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {originalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.original[index % COLORS.original.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _label, entry) => [
                    `${Number(value).toFixed(2)}%`,
                    getDisplayName(entry?.payload?.ticker)
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {originalDistribution.length > 0 && (
            <div className="chart-legend">
              {originalDistribution.map((item, index) => (
                <div key={item.ticker} className="legend-row">
                  <span
                    className="bullet"
                    style={{ backgroundColor: COLORS.original[index % COLORS.original.length] }}
                  />
                  <span className="legend-name">
                    {item.ticker} · {item.name}
                  </span>
                  <span className="legend-value">
                    {item.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quantum Optimized */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-xl font-bold mb-4 text-center">
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
                  label={({ name, ticker, value }) => `${name} (${ticker})\n${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quantumDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.optimized[index % COLORS.optimized.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _label, entry) => [
                    `${Number(value).toFixed(2)}%`,
                    getDisplayName(entry?.payload?.ticker)
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {quantumDistribution.length > 0 && (
            <div className="chart-legend">
              {quantumDistribution.map((item, index) => (
                <div key={item.ticker} className="legend-row">
                  <span
                    className="bullet"
                    style={{ backgroundColor: COLORS.optimized[index % COLORS.optimized.length] }}
                  />
                  <span className="legend-name">
                    {item.ticker} · {item.name}
                  </span>
                  <span className="legend-value">
                    {item.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 text-center">
          {language === 'ko' ? '📈 성과 비교' : '📈 Performance Comparison'}
        </h3>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="original" fill="#FF6B6B" name={language === 'ko' ? '기존' : 'Original'} />
            <Bar dataKey="quantum" fill="#6C5CE7" name={language === 'ko' ? '양자 최적화' : 'Quantum'} />
          </BarChart>
        </ResponsiveContainer>

        {/* Improvement Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisonData.map((metric, idx) => {
            const isReturnOrSharpe = idx === 0 || idx === 2;
            const quantumBetter = isReturnOrSharpe
              ? metric.quantum > metric.original
              : metric.quantum < metric.original;
            const improvement = isReturnOrSharpe
              ? ((metric.quantum - metric.original) / Math.abs(metric.original || 1)) * 100
              : ((metric.original - metric.quantum) / Math.abs(metric.original || 1)) * 100;

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  quantumBetter
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="text-sm text-gray-600 mb-2">{metric.name}</div>
                <div className="text-lg font-bold">
                  {quantumBetter ? '✅ ' + (language === 'ko' ? '개선됨' : 'Improved') : '➡️ ' + (language === 'ko' ? '유사' : 'Similar')}
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
                  <div className="text-xs text-green-600 mt-1 font-semibold">
                    {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}% {language === 'ko' ? '개선' : 'improvement'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View Detailed Analytics Button */}
        <button
          onClick={goToAnalytics}
          className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-colors"
        >
          📊 {t('viewDetailedAnalytics')} →
        </button>
      </div>
    </div>
  );
}
