import { useState } from "react";
import axios from "axios";

export default function PortfolioOptimizer() {
  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT");
  const [riskFactor, setRiskFactor] = useState(0.5);
  const [method, setMethod] = useState("classical");
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

      if (tickerArray.length === 0) {
        setError("최소 하나의 주식 티커를 입력해주세요.");
        setLoading(false);
        return;
      }

      // 양자 최적화는 시간이 오래 걸릴 수 있으므로 타임아웃을 길게 설정
      const timeout = method === "quantum" ? 300000 : 60000; // 양자: 5분, 고전적: 1분
      
      // Check auto-save setting from localStorage
      const autoSave = localStorage.getItem('autoSave') === 'true';
      
      const response = await axios.post(
        "/api/portfolio/optimize",
        {
          tickers: tickerArray,
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
        setError(response.data.error || "최적화에 실패했습니다.");
      }
    } catch (err) {
      console.error("Optimization error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(`요청 실패: ${err.message}`);
      } else {
        setError("최적화 요청에 실패했습니다. 서버가 실행 중인지 확인해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-optimizer">
      <div className="container">
        <h2 className="title">📈 Portfolio Optimizer</h2>
        <p className="subtitle">Qiskit을 활용한 포트폴리오 최적화</p>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="tickers" className="label">
              주식 티커 (쉼표로 구분):
            </label>
            <input
              id="tickers"
              type="text"
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
              placeholder="예: AAPL, GOOGL, MSFT, AMZN, TSLA"
              className="input"
              disabled={loading}
            />
            <small className="hint">
              주식 티커를 쉼표로 구분하여 입력하세요
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="riskFactor" className="label">
              리스크 팩터: {riskFactor}
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

          <button
            onClick={handleOptimize}
            disabled={loading}
            className={`button ${loading ? "loading" : ""}`}
          >
            {loading ? "⏳ 최적화 중..." : "🚀 최적화 실행"}
          </button>
        </div>

        {error && (
          <div className="error-box">
            <h3>❌ 오류</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-box">
            <h3>✅ 최적화 결과</h3>
            
            <div className="result-section">
              <h4>선택된 주식</h4>
              <div className="ticker-list">
                {result.selected_tickers.map((ticker, index) => (
                  <span key={ticker} className="ticker-badge">
                    {ticker} ({((result.weights[index] || 0) * 100).toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>

            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">예상 수익률</span>
                <span className="result-value positive">
                  {(result.expected_return * 100).toFixed(2)}%
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">리스크</span>
                <span className="result-value">
                  {(result.risk * 100).toFixed(2)}%
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">샤프 비율</span>
                <span className="result-value">
                  {result.sharpe_ratio.toFixed(2)}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">최적화 방법</span>
                <span className="result-value">
                  {result.method === "classical" ? "고전적" : "양자 (QAOA)"}
                </span>
              </div>
            </div>

            {result.method === "quantum" && result.quantum_verified && (
              <div className="result-section" style={{ marginTop: "1rem", padding: "1rem", background: "#e8f5e9", borderRadius: "8px", border: "2px solid #4caf50" }}>
                <h4 style={{ color: "#2e7d32", marginBottom: "0.5rem" }}>🔬 양자 최적화 확인</h4>
                <p style={{ color: "#1b5e20", marginBottom: "0.5rem" }}>
                  ✅ QAOA 알고리즘이 성공적으로 실행되었습니다!
                </p>
                {result.optimization_value && (
                  <p style={{ color: "#1b5e20", fontSize: "0.9rem" }}>
                    최적화 값: {result.optimization_value.toFixed(6)}
                  </p>
                )}
                {result.solution_vector && (
                  <p style={{ color: "#1b5e20", fontSize: "0.9rem" }}>
                    최적해 벡터: [{result.solution_vector.map(v => v.toFixed(1)).join(", ")}]
                  </p>
                )}
                {result.reps && (
                  <p style={{ color: "#1b5e20", fontSize: "0.9rem" }}>
                    QAOA Reps: {result.reps}
                  </p>
                )}
              </div>
            )}

            {result.method === "classical" && (
              <div className="result-section" style={{ marginTop: "1rem", padding: "1rem", background: "#fff3e0", borderRadius: "8px", border: "2px solid #ff9800" }}>
                <p style={{ color: "#e65100", fontSize: "0.9rem" }}>
                  ℹ️ 고전적 최적화 (NumPy)를 사용했습니다.
                </p>
              </div>
            )}

            <details className="json-details">
              <summary>전체 결과 (JSON)</summary>
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

