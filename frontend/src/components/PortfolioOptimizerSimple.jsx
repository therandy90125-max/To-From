import { useState } from "react";
import axios from "axios";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PortfolioOptimizerSimple() {
  const [tickers, setTickers] = useState("AAPL,MSFT,TSLA");
  const [riskFactor, setRiskFactor] = useState(0.5);
  const [method, setMethod] = useState("quantum");
  const [period, setPeriod] = useState("1y");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/optimize", {
        tickers: tickers.split(",").map(t => t.trim()),
        risk_factor: riskFactor,
        method,
        period
      });
      setResult(response.data);
    } catch (err) {
      alert("❌ Optimization request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded p-6">
      <label className="block mb-2 font-semibold">Tickers (comma-separated):</label>
      <input
        className="border p-2 w-full mb-4"
        value={tickers}
        onChange={(e) => setTickers(e.target.value)}
      />

      <label className="block mb-2 font-semibold">Risk Factor: {riskFactor}</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={riskFactor}
        onChange={(e) => setRiskFactor(e.target.value)}
        className="w-full mb-4"
      />

      <label className="block mb-2 font-semibold">Optimization Method:</label>
      <select
        className="border p-2 w-full mb-4"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option value="quantum">Quantum</option>
        <option value="classical">Classical</option>
      </select>

      <label className="block mb-2 font-semibold">Data Period:</label>
      <select
        className="border p-2 w-full mb-4"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
      >
        <option value="1y">1 Year</option>
        <option value="6m">6 Months</option>
        <option value="3m">3 Months</option>
      </select>

      <button
        onClick={handleOptimize}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Optimizing..." : "Run Optimization"}
      </button>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result</h3>
          <pre className="bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
          {result.data && (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis dataKey="risk" name="Risk" />
                  <YAxis dataKey="return" name="Return" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={result.data} fill="#2563eb" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

