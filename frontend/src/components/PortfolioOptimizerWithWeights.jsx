import { useState } from "react";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";

export default function PortfolioOptimizerWithWeights() {
  const { t } = useLanguage();
  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT");
  const [weights, setWeights] = useState("0.4,0.4,0.2");
  const [riskFactor, setRiskFactor] = useState(0.5);
  const [method, setMethod] = useState("quantum");
  const [period, setPeriod] = useState("1y");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const tickerArray = tickers
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const weightArray = weights
        .split(",")
        .map((w) => parseFloat(w.trim()))
        .filter((w) => !isNaN(w));

      if (tickerArray.length === 0) {
        setError(t('minimumOneTicker'));
        setLoading(false);
        return;
      }

      if (tickerArray.length !== weightArray.length) {
        setError(t('tickerWeightMismatch') + ` (${tickerArray.length} vs ${weightArray.length})`);
        setLoading(false);
        return;
      }

      const weightSum = weightArray.reduce((a, b) => a + b, 0);
      if (Math.abs(weightSum - 1.0) > 0.01) {
        setError(t('weightSumMustBeOne') + ` (${t('current')}: ${weightSum.toFixed(4)})`);
        setLoading(false);
        return;
      }

      const timeout = method === "quantum" ? 300000 : 60000;

      // Check auto-save setting from localStorage
      const autoSave = localStorage.getItem('autoSave') === 'true';

      const response = await axios.post(
        "/api/portfolio/optimize/with-weights",
        {
          tickers: tickerArray,
          initial_weights: weightArray,
          risk_factor: riskFactor,
          method: method,
          period: period,
          auto_save: autoSave,
        },
        {
          timeout: timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || t('optimizationFailed'));
      }
    } catch (err) {
      console.error("Optimization error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(`${t('requestFailed')}: ${err.message}`);
      } else {
        setError(t('serverNotRunning'));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPieChart = (data, title) => {
    if (!data) return null;
    
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    let total = 0;
    const segments = data.tickers.map((ticker, idx) => {
      const weight = data.weights[idx];
      total += weight;
      return { ticker, weight, color: colors[idx % colors.length] };
    });

    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    let currentAngle = -Math.PI / 2;

    return (
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333' }}>{title}</h4>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments.map((seg, idx) => {
            const angle = seg.weight * 2 * Math.PI;
            const x1 = centerX + radius * Math.cos(currentAngle);
            const y1 = centerY + radius * Math.sin(currentAngle);
            const x2 = centerX + radius * Math.cos(currentAngle + angle);
            const y2 = centerY + radius * Math.sin(currentAngle + angle);
            const largeArc = angle > Math.PI ? 1 : 0;
            
            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            const labelAngle = currentAngle + angle / 2;
            const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
            const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);
            
            currentAngle += angle;
            
            return (
              <g key={idx}>
                <path d={path} fill={seg.color} stroke="#fff" strokeWidth="2" />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {(seg.weight * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ marginTop: '1rem' }}>
          {segments.map((seg, idx) => (
            <div key={idx} style={{ display: 'inline-block', margin: '0.25rem', fontSize: '0.85rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: seg.color,
                  marginRight: '0.25rem',
                  verticalAlign: 'middle',
                }}
              />
              {seg.ticker} ({(seg.weight * 100).toFixed(1)}%)
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="portfolio-optimizer">
      <div className="container">
        <h2 className="title">📊 {t('portfolioWeightOptimization')}</h2>
        <p className="subtitle">{t('portfolioWeightOptimizationSubtitle')}</p>

        <div className="form-section">
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
          </div>

          <div className="form-group">
            <label htmlFor="weights" className="label">
              {t('existingWeights')}:
            </label>
            <input
              id="weights"
              type="text"
              value={weights}
              onChange={(e) => setWeights(e.target.value)}
              placeholder={t('weightsPlaceholder')}
              className="input"
              disabled={loading}
            />
            <small className="hint">
              {t('weightsHint')}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="riskFactor" className="label">
              {t('riskFactor')}: {riskFactor}
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
              <option value="quantum">{t('quantumOptimizationRecommended')}</option>
              <option value="classical">{t('classicalOptimizationFast')}</option>
            </select>
          </div>

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

          <button
            onClick={handleOptimize}
            disabled={loading}
            className={`button ${loading ? "loading" : ""}`}
          >
            {loading ? `⏳ ${t('optimizing')}` : `🚀 ${t('runOptimization')}`}
          </button>
        </div>

        {error && (
          <div className="error-box">
            <h3>❌ {t('error')}</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-box">
            <h3>✅ {t('optimizationResult')}</h3>
            
            {/* 원본 vs 최적화 비교 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
              {renderPieChart(result.original, t('originalPortfolio'))}
              {renderPieChart(result.optimized, t('optimizedPortfolio'))}
            </div>

            {/* 성과 비교 */}
            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '2px solid #dc3545'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.2rem' }}>
                {t('performance')} ({t('performance')})
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {/* 예상 수익률 */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                    {t('expectedReturnLabel')} ({t('expectedReturn')})
                  </h4>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                      {t('original')} ({t('original')}): <strong>{(result.original.expected_return).toFixed(4)}</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      {t('optimized')} ({t('optimized')}): <strong>{(result.optimized.expected_return).toFixed(4)}</strong>
                    </div>
                    <div style={{ 
                      color: result.improvements.return_improvement > 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {t('improvement')}: {result.improvements.return_improvement > 0 ? '+' : ''}
                      {result.improvements.return_improvement.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* 위험 (분산) */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                    {t('riskVariance')} ({t('riskVariance')})
                  </h4>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                      {t('original')} ({t('original')}): <strong>{(result.original.risk * result.original.risk).toFixed(4)}</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      {t('optimized')} ({t('optimized')}): <strong>{(result.optimized.risk * result.optimized.risk).toFixed(4)}</strong>
                    </div>
                    <div style={{ 
                      color: result.improvements.risk_change < 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {t('change')}: {result.improvements.risk_change > 0 ? '+' : ''}
                      {result.improvements.risk_change.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* 최적화 점수 */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                    {t('optimizationScore')} ({t('optimizationScore')})
                  </h4>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                      {t('original')} ({t('original')}): <strong>{result.original.optimization_score?.toFixed(4) || result.original.sharpe_ratio.toFixed(4)}</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      {t('optimized')} ({t('optimized')}): <strong>{result.optimized.optimization_score?.toFixed(4) || result.optimized.sharpe_ratio.toFixed(4)}</strong>
                    </div>
                    <div style={{ 
                      color: result.improvements.score_improvement > 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {t('improvement')}: {result.improvements.score_improvement > 0 ? '+' : ''}
                      {result.improvements.score_improvement.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* 개선율 강조 표시 */}
              {result.improvements.return_improvement > 0 && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  background: '#fff3cd', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #ffc107'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⭐</div>
                  <div style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: '#856404'
                  }}>
                    +{result.improvements.return_improvement.toFixed(2)}% {t('returnImprovement')}
                  </div>
                </div>
              )}
            </div>

            {result.method === "quantum" && result.quantum_verified && (
              <div className="result-section" style={{ marginTop: "1rem", padding: "1rem", background: "#e8f5e9", borderRadius: "8px", border: "2px solid #4caf50" }}>
                <h4 style={{ color: "#2e7d32", marginBottom: "0.5rem" }}>🔬 {t('quantumVerified')}</h4>
                <p style={{ color: "#1b5e20" }}>
                  ✅ {t('qaoaSuccessfullyExecuted')}
                </p>
              </div>
            )}

            <details className="json-details">
              <summary>{t('fullResultJson')}</summary>
              <pre className="json-output">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

