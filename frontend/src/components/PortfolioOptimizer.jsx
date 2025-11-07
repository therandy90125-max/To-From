import { useState } from "react";
import { useOptimization } from '../hooks/useOptimization';
import { 
  parseTickers, 
  validateTickers, 
  getRiskLevelText, 
  getMethodText,
  formatPercent 
} from '../utils/portfolioUtils';
import StockPriceWidget from './StockPriceWidget';

export default function PortfolioOptimizer() {
  // UI State
  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT");
  const [riskFactor, setRiskFactor] = useState(0.5);
  const [method, setMethod] = useState("classical");
  const [period, setPeriod] = useState("1y");

  // Use custom hook for optimization logic
  const { result, loading, error, optimizePortfolio } = useOptimization();

  const handleOptimize = async () => {
    // 1. Parse tickers
    const tickerArray = parseTickers(tickers);
    
    // 2. Validate
    const validation = validateTickers(tickerArray);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // 3. Optimize (hook handles all API logic)
    await optimizePortfolio(tickerArray, riskFactor, method, period);
  };

  return (
    <div className="portfolio-optimizer">
      <div className="container">
        <h2 className="title">📈 Portfolio Optimizer</h2>
        <p className="subtitle">Qiskit을 활용한 포트폴리오 최적화</p>

        <div className="form-section">
          {/* Tickers Input */}
          <div className="form-group">
            <label htmlFor="tickers" className="label">
              주식 티커 (쉼표로 구분):
            </label>
            <input
              id="tickers"
              type="text"
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
              placeholder="예: AAPL, GOOGL, MSFT, 005930"
              className="input"
              disabled={loading}
            />
            <small className="hint">
              주식 티커를 쉼표로 구분하여 입력하세요 (한국 주식: 005930, 미국 주식: AAPL)
            </small>
            
            {/* Real-time Price Preview */}
            {tickers && (
              <div className="mt-3 flex flex-wrap gap-2">
                {parseTickers(tickers).map((ticker, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 shadow-sm">
                    <StockPriceWidget symbol={ticker} showDetails={false} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risk Factor Slider */}
          <div className="form-group">
            <label htmlFor="riskFactor" className="label">
              리스크 팩터: {riskFactor} ({getRiskLevelText(riskFactor)})
            </label>
            <input
              id="riskFactor"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={riskFactor}
              onChange={(e) => setRiskFactor(parseFloat(e.target.value))}
              className="slider"
              disabled={loading}
            />
            <div className="slider-labels">
              <span>공격적 (0.0)</span>
              <span>보수적 (1.0)</span>
            </div>
          </div>

          {/* Method Selection */}
          <div className="form-group">
            <label htmlFor="method" className="label">
              최적화 방법:
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="select"
              disabled={loading}
            >
              <option value="classical">고전적 최적화 (빠름)</option>
              <option value="quantum">양자 최적화 - QAOA (느림)</option>
            </select>
          </div>

          {/* Period Selection */}
          <div className="form-group">
            <label htmlFor="period" className="label">
              데이터 기간:
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="select"
              disabled={loading}
            >
              <option value="1mo">1개월</option>
              <option value="3mo">3개월</option>
              <option value="6mo">6개월</option>
              <option value="1y">1년</option>
            </select>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={loading}
            className={`button ${loading ? "loading" : ""}`}
          >
            {loading ? "⏳ 최적화 중..." : "🚀 최적화 실행"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-box">
            <h3>❌ 오류</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="result-box">
            <h3>✅ 최적화 결과</h3>
            
            {/* Selected Stocks */}
            <div className="result-section">
              <h4>선택된 주식</h4>
              <div className="ticker-list">
                {result.selected_tickers?.map((ticker, index) => (
                  <span key={ticker} className="ticker-badge">
                    {ticker} ({formatPercent(result.weights[index] || 0, 1)})
                  </span>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">예상 수익률</span>
                <span className="result-value positive">
                  {formatPercent(result.expected_return)}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">리스크</span>
                <span className="result-value">
                  {formatPercent(result.risk)}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">샤프 비율</span>
                <span className="result-value">
                  {result.sharpe_ratio?.toFixed(2)}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">최적화 방법</span>
                <span className="result-value">
                  {getMethodText(result.method)}
                </span>
              </div>
            </div>

            {/* Quantum Verification (if quantum method) */}
            {result.method === "quantum" && result.quantum_verified && (
              <div className="result-section quantum-section">
                <h4>🔬 양자 최적화 확인</h4>
                <p>✅ QAOA 알고리즘이 성공적으로 실행되었습니다!</p>
                {result.optimization_value && (
                  <p>최적화 값: {result.optimization_value.toFixed(6)}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
