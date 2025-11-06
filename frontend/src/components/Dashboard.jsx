import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";

export default function Dashboard({ onNavigateToOptimizer }) {
  const { t } = useLanguage();
  const [portfolioValue, setPortfolioValue] = useState(125430);
  const [portfolioReturn, setPortfolioReturn] = useState(12.34);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [optimizerTickers, setOptimizerTickers] = useState("");
  const [targetRisk, setTargetRisk] = useState(0.15);
  const [optimizing, setOptimizing] = useState(false);

  const handleQuickOptimize = async () => {
      if (!optimizerTickers.trim()) {
        alert(t('minimumOneTicker'));
        return;
      }

    try {
      setOptimizing(true);
      const tickerArray = optimizerTickers
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // 균등 비중으로 시작
      const equalWeight = 1.0 / tickerArray.length;
      const initialWeights = Array(tickerArray.length).fill(equalWeight);

      const response = await axios.post(
        "http://localhost:5000/api/optimize/with-weights",
        {
          tickers: tickerArray,
          initial_weights: initialWeights,
          risk_factor: targetRisk,
          method: "quantum",
          period: "1y",
        },
        {
          timeout: 300000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setOptimizationResult(response.data.result.optimized);
        // 포트폴리오 가치 업데이트 (예시)
        const newReturn = response.data.result.optimized.expected_return * 100;
        setPortfolioReturn(newReturn);
      }
      } catch (err) {
        console.error("Optimization error:", err);
        alert(t('optimizationFailed') + ": " + (err.response?.data?.error || err.message));
      } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="dashboard">
      {/* 상단 요약 */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>{t('totalPortfolioValue')}</h3>
          <p className="summary-value">${portfolioValue.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>{t('return')}</h3>
          <p className="summary-value positive">+ {portfolioReturn.toFixed(2)}%</p>
        </div>
      </div>

      {/* 포트폴리오 가치 그래프 */}
      <div className="dashboard-widget">
        <h3 className="widget-title">{t('portfolioValue')}</h3>
        <div className="widget-content">
          <div className="chart-placeholder">
            <svg width="100%" height="200" viewBox="0 0 400 200">
              <polyline
                points="0,180 50,170 100,160 150,150 200,140 250,130 300,120 350,110 400,100"
                fill="none"
                stroke="#667eea"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 그리드 레이아웃 */}
      <div className="dashboard-grid">
        {/* 최적화 결과 위젯 */}
        <div className="dashboard-widget">
          <h3 className="widget-title">{t('optimizationResult')}</h3>
          <div className="widget-content">
            {optimizationResult ? (
              <div>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  {t('optimizedWeights')}
                </p>
                <div className="pie-chart-mini" style={{ marginBottom: '1rem' }}>
                  {/* 파이 차트는 나중에 개선 */}
                </div>
                <div className="widget-metrics">
                  <div>
                    <span>AI TSK</span>
                    <strong>{optimizationResult.optimization_score?.toFixed(2) || '1.25'}</strong>
                  </div>
                  <div>
                    <span>{t('sharpeRatio')}</span>
                    <strong>{optimizationResult.sharpe_ratio?.toFixed(2) || '1.25'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="placeholder-text">
                {t('optimizationWillBeDisplayedHere')}
              </p>
            )}
          </div>
        </div>

        {/* 챗봇 위젯 */}
        <div className="dashboard-widget">
          <h3 className="widget-title">{t('chatbot')}</h3>
          <div className="widget-content">
            <button 
              className="chatbot-button"
              onClick={() => onNavigateToOptimizer && onNavigateToOptimizer('chatbot')}
            >
              {t('askTnfAnything')}
            </button>
            <div className="chatbot-question">{t('whatIsSharpeRatio')}</div>
            <div className="chatbot-input">
              <input type="text" placeholder={t('typeMessage')} />
              <button>{t('optimize')}</button>
            </div>
          </div>
        </div>

        {/* 최적화 실행 위젯 */}
        <div className="dashboard-widget">
          <h3 className="widget-title">{t('optimizer')}</h3>
          <div className="widget-content">
            <input
              type="text"
              placeholder={t('enterAssets')}
              className="widget-input"
              value={optimizerTickers}
              onChange={(e) => setOptimizerTickers(e.target.value)}
              disabled={optimizing}
            />
            <div className="widget-field">
              <label>{t('targetRisk')}</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="1"
                value={targetRisk} 
                className="widget-input-small"
                onChange={(e) => setTargetRisk(parseFloat(e.target.value) || 0)}
                disabled={optimizing}
              />
            </div>
            <button 
              className="widget-button"
              onClick={handleQuickOptimize}
              disabled={optimizing}
            >
              {optimizing ? t('optimize') + '...' : t('optimize')}
            </button>
            <button
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
              onClick={() => onNavigateToOptimizer && onNavigateToOptimizer('optimizer')}
            >
              {t('goToOptimizerPage')}
            </button>
          </div>
        </div>

        {/* 결과 시각화 위젯 */}
        <div className="dashboard-widget">
          <h3 className="widget-title">{t('resultVisualization')}</h3>
          <div className="widget-content">
            <div className="widget-metrics">
              <div>
                <span>{t('balance')}</span>
                <strong>{optimizationResult?.sharpe_ratio?.toFixed(2) || '1.25'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
