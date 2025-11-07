import { useState } from "react";
import { useOptimization } from '../hooks/useOptimization';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  parseTickers, 
  validateTickers, 
  getRiskLevelText, 
  getMethodText,
  formatPercent 
} from '../utils/portfolioUtils';
import StockPriceWidget from './StockPriceWidget';

export default function PortfolioOptimizer() {
  const { t } = useLanguage();
  
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
        <h2 className="title">📈 {t('portfolioOptimization')}</h2>
        <p className="subtitle">{t('portfolioWeightOptimizationSubtitle')}</p>

        <div className="form-section">
          {/* Tickers Input */}
          <div className="form-group">
            <label htmlFor="tickers" className="label">
              {t('stockTickersComma')}:
            </label>
            <input
              id="tickers"
              type="text"
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
              placeholder={t('stockTickersPlaceholder')}
              className="input"
              disabled={loading}
            />
            <small className="hint">
              {t('enterTickersHint')}
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
              {t('riskFactor')}: {riskFactor} ({getRiskLevelText(riskFactor)})
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
              <span>{t('aggressive')}</span>
              <span>{t('conservative')}</span>
            </div>
          </div>

          {/* Method Selection */}
          <div className="form-group">
            <label htmlFor="method" className="label">
              {t('optimizationMethod')}:
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="select"
              disabled={loading}
            >
              <option value="classical">{t('classicalOptimizationFast')}</option>
              <option value="quantum">{t('quantumOptimizationRecommended')}</option>
            </select>
          </div>

          {/* Period Selection */}
          <div className="form-group">
            <label htmlFor="period" className="label">
              {t('dataPeriod')}:
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="select"
              disabled={loading}
            >
              <option value="1mo">{t('oneMonth')}</option>
              <option value="3mo">{t('threeMonths')}</option>
              <option value="6mo">{t('sixMonths')}</option>
              <option value="1y">{t('oneYear')}</option>
            </select>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={loading}
            className={`button ${loading ? "loading" : ""}`}
          >
            {loading ? `⏳ ${t('optimizing')}` : `🚀 ${t('runOptimization')}`}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-box">
            <h3>❌ {t('error')}</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="result-box">
            <h3>✅ {t('optimizationResult')}</h3>
            
            {/* Selected Stocks */}
            <div className="result-section">
              <h4>{t('selectedStocks')}</h4>
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
                <span className="result-label">{t('expectedReturnLabel')}</span>
                <span className="result-value positive">
                  {formatPercent(result.expected_return)}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">{t('riskLabel')}</span>
                <span className="result-value">
                  {formatPercent(result.risk)}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">{t('sharpeRatioLabel')}</span>
                <span className="result-value">
                  {result.sharpe_ratio?.toFixed(2)}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">{t('optimizationMethodLabel')}</span>
                <span className="result-value">
                  {getMethodText(result.method)}
                </span>
              </div>
            </div>

            {/* Quantum Verification (if quantum method) */}
            {result.method === "quantum" && result.quantum_verified && (
              <div className="result-section quantum-section">
                <h4>🔬 {t('quantumVerified')}</h4>
                <p>✅ {t('qaoaSuccessfullyExecuted')}</p>
                {result.optimization_value && (
                  <p>{t('optimizationValue')}: {result.optimization_value.toFixed(6)}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
