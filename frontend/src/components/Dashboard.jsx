import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import StockSearchInput from "./StockSearchInput";
import axios from "axios";

export default function Dashboard({ onNavigateToOptimizer }) {
  const { t } = useLanguage();
  const [portfolioValue, setPortfolioValue] = useState(125430);
  const [portfolioReturn, setPortfolioReturn] = useState(12.34);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [targetRisk, setTargetRisk] = useState(0.15);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationMethod, setOptimizationMethod] = useState('quantum'); // quantum or classical
  
  // 주식 목록 관리
  const [stocks, setStocks] = useState([]);

  const handleAddStock = (stock) => {
    // 이미 추가된 주식인지 확인
    if (stocks.find(s => s.ticker === stock.ticker)) {
      alert(`${stock.ticker}는 이미 추가되었습니다.`);
      return;
    }
    
    setStocks([...stocks, {
      ticker: stock.ticker,
      name: stock.name,
      exchange: stock.exchange,
      shares: 0,
      price: 0, // TODO: 실시간 가격 API 연동
      value: 0
    }]);
  };

  const handleRemoveStock = (ticker) => {
    setStocks(stocks.filter(s => s.ticker !== ticker));
  };

  const handleSharesChange = (ticker, shares) => {
    setStocks(stocks.map(s => {
      if (s.ticker === ticker) {
        const newShares = parseInt(shares) || 0;
        return {
          ...s,
          shares: newShares,
          value: newShares * s.price
        };
      }
      return s;
    }));
  };

  const getTotalValue = () => {
    return stocks.reduce((sum, stock) => sum + stock.value, 0);
  };

  const handleQuickOptimize = async () => {
    if (stocks.length === 0) {
      alert(t('minimumOneTicker'));
      return;
    }

    try {
      setOptimizing(true);
      const tickerArray = stocks.map(s => s.ticker);

      // 균등 비중으로 시작
      const equalWeight = 1.0 / tickerArray.length;
      const initialWeights = Array(tickerArray.length).fill(equalWeight);

      // Check auto-save setting from localStorage
      const autoSave = localStorage.getItem('autoSave') === 'true';

      const response = await axios.post(
        "/api/portfolio/optimize/with-weights",
        {
          tickers: tickerArray,
          initial_weights: initialWeights,
          risk_factor: targetRisk,
          method: optimizationMethod,
          period: "1y",
          auto_save: autoSave,
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
        {/* 주식 입력 위젯 */}
        <div className="dashboard-widget" style={{ gridColumn: 'span 2' }}>
          <h3 className="widget-title">{t('stockList')}</h3>
          <div className="widget-content">
            {/* 주식 검색 */}
            <div style={{ marginBottom: '1rem' }}>
              <StockSearchInput
                onSelectStock={handleAddStock}
                disabled={optimizing}
              />
            </div>

            {/* 주식 목록 */}
            {stocks.length > 0 ? (
              <div className="stock-list">
                <div className="stock-list-header">
                  <div>{t('ticker')}</div>
                  <div>{t('name')}</div>
                  <div>{t('shares')}</div>
                  <div>{t('price')}</div>
                  <div>{t('value')}</div>
                  <div></div>
                </div>
                {stocks.map(stock => (
                  <div key={stock.ticker} className="stock-list-item">
                    <div className="stock-ticker-cell">{stock.ticker}</div>
                    <div className="stock-name-cell">{stock.name}</div>
                    <div className="stock-shares-cell">
                      <input
                        type="number"
                        min="0"
                        value={stock.shares}
                        onChange={(e) => handleSharesChange(stock.ticker, e.target.value)}
                        placeholder={t('sharesPlaceholder')}
                        disabled={optimizing}
                        className="shares-input"
                      />
                    </div>
                    <div className="stock-price-cell">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className="stock-value-cell">
                      ${stock.value.toFixed(2)}
                    </div>
                    <div className="stock-actions-cell">
                      <button
                        onClick={() => handleRemoveStock(stock.ticker)}
                        disabled={optimizing}
                        className="remove-button"
                      >
                        {t('removeStock')}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="stock-list-total">
                  <div>{t('total')}</div>
                  <div></div>
                  <div>{stocks.reduce((sum, s) => sum + s.shares, 0)}</div>
                  <div></div>
                  <div>${getTotalValue().toFixed(2)}</div>
                  <div></div>
                </div>
              </div>
            ) : (
              <p className="placeholder-text" style={{ textAlign: 'center', padding: '2rem' }}>
                {t('searchStockOrTicker')}
              </p>
            )}

            {/* 최적화 설정 */}
            {stocks.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div className="widget-field" style={{ marginBottom: '1rem' }}>
                  <label>{t('optimizationMethod')}</label>
                  <select 
                    value={optimizationMethod}
                    onChange={(e) => setOptimizationMethod(e.target.value)}
                    className="widget-input-small"
                    disabled={optimizing}
                  >
                    <option value="quantum">⚛️ {t('quantumOptimization')} - QAOA</option>
                    <option value="classical">📊 {t('classicalOptimization')}</option>
                  </select>
                </div>
                <div className="widget-field" style={{ marginBottom: '1rem' }}>
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
                  style={{ width: '100%' }}
                >
                  {optimizing ? t('optimizing') : t('optimize')}
                </button>
              </div>
            )}
          </div>
        </div>

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
              <button>{t('send')}</button>
            </div>
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
            <button
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}
              onClick={() => onNavigateToOptimizer && onNavigateToOptimizer('optimizer')}
            >
              {t('goToOptimizerPage')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
