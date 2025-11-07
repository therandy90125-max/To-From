import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [stocks, setStocks] = useState([
    { 
      ticker: 'AAPL', 
      name: 'Apple Inc.', 
      market: '해외',
      price: '250,000',
      shares: 10 
    },
    { 
      ticker: '005930.KS', 
      name: 'Samsung Electronics', 
      market: '국내',
      price: '75,000',
      shares: 0 
    }
  ]);
  const [investmentAmount, setInvestmentAmount] = useState('자동 계산');
  const [riskLevel, setRiskLevel] = useState(5);
  const [optimizationMethod, setOptimizationMethod] = useState('QAOA');
  const [period, setPeriod] = useState('1y');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search stocks with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchStocks(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchStocks = async (query) => {
    try {
      const response = await fetch(`http://localhost:8080/api/stocks/search?q=${query}`);
      const data = await response.json();
      if (data.success && data.results) {
        setSearchResults(data.results);
        setShowDropdown(data.results.length > 0);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const addStockFromSearch = (result) => {
    // Check if stock already exists
    const exists = stocks.some(s => s.ticker === result.ticker);
    if (!exists) {
      setStocks([...stocks, {
        ticker: result.ticker,
        name: result.name,
        market: result.exchange.includes('KS') || result.exchange.includes('KRX') ? '국내' : '해외',
        price: '가격 조회 중...',
        shares: 0
      }]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const updateShares = (index, value) => {
    const newStocks = [...stocks];
    newStocks[index].shares = parseInt(value) || 0;
    setStocks(newStocks);
  };

  const removeStock = (index) => {
    const newStocks = stocks.filter((_, idx) => idx !== index);
    setStocks(newStocks);
  };

  const handleOptimize = async () => {
    // Validate stocks: filter out invalid tickers
    const validStocks = stocks.filter(s => s.ticker && s.ticker.trim() !== '');
    
    if (validStocks.length < 2) {
      alert('최소 2개 이상의 유효한 주식을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // Calculate initial weights based on shares
      const totalShares = validStocks.reduce((sum, s) => sum + s.shares, 0);
      const initialWeights = validStocks.map(s => 
        totalShares > 0 ? s.shares / totalShares : 1.0 / validStocks.length
      );

      console.log('Optimization request:', {
        tickers: validStocks.map(s => s.ticker),
        initial_weights: initialWeights,
        period: period,
        risk_factor: riskLevel / 10,
        method: optimizationMethod.toLowerCase() === 'qaoa' ? 'quantum' : 'classical'
      });

      const response = await fetch('http://localhost:8080/api/portfolio/optimize/with-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickers: validStocks.map(s => s.ticker),
          initial_weights: initialWeights,
          period: period,
          risk_factor: riskLevel / 10,
          method: optimizationMethod.toLowerCase() === 'qaoa' ? 'quantum' : 'classical',
          auto_save: false
        })
      });
      
      const data = await response.json();
      console.log('Optimization response:', data);
      
      if (data.success) {
        setResults(data.result.optimized);
        alert('✅ 최적화 성공!');
      } else {
        alert('최적화 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Optimization error:', error);
      alert('최적화 실패: ' + error.message + '\n\n콘솔을 확인하세요 (F12).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Stock Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800">주식 검색</h2>
          </div>
          
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="종목명 또는 코드를 입력하세요 (예: 삼성전자, AAPL)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            
            {/* Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => addStockFromSearch(result)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                  >
                    <span className="font-semibold text-blue-600">{result.ticker}</span>
                    <span className="text-gray-700 ml-2">{result.name}</span>
                    <span className="text-gray-400 ml-2 text-sm">({result.exchange})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stock Input Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-gray-800">주식 입력</h2>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-3 pb-2 border-b-2 border-gray-200 font-semibold text-gray-700 text-sm">
            <div>종목 코드</div>
            <div>종목명</div>
            <div>시장</div>
            <div>현재 가격 (원)</div>
            <div>보유 수량 (주)</div>
            <div>삭제</div>
          </div>
          
          {/* Stock Rows */}
          {stocks.map((stock, idx) => (
            <div key={idx} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100">
              <input 
                value={stock.ticker} 
                readOnly 
                className="p-2 bg-gray-50 border border-gray-200 rounded text-sm"
              />
              <input 
                value={stock.name} 
                readOnly 
                className="p-2 bg-gray-50 border border-gray-200 rounded text-sm"
              />
              <select 
                value={stock.market}
                onChange={(e) => {
                  const newStocks = [...stocks];
                  newStocks[idx].market = e.target.value;
                  setStocks(newStocks);
                }}
                className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option>해외</option>
                <option>국내</option>
              </select>
              <input 
                value={stock.price} 
                readOnly 
                className="p-2 bg-gray-50 border border-gray-200 rounded text-sm"
              />
              <input 
                type="number" 
                min="0"
                value={stock.shares}
                onChange={(e) => updateShares(idx, e.target.value)}
                placeholder="예: 10"
                className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeStock(idx)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
              >
                삭제
              </button>
            </div>
          ))}
          
          {stocks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">📊 주식을 검색하여 추가해주세요</p>
              <p className="text-sm">위의 검색창에서 종목을 찾아 추가할 수 있습니다</p>
            </div>
          )}
        </div>

        {/* Optimization Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            
            {/* Investment Amount */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                투자 금액 (원)
              </label>
              <input
                type="text"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="자동 계산"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Risk Level */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                위험도 (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={riskLevel}
                onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Optimization Method */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                최적화 방법
              </label>
              <select 
                value={optimizationMethod}
                onChange={(e) => setOptimizationMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="QAOA">QAOA (Quantum Approximate Optimization)</option>
                <option value="QMVS">QMVS (Quantum Minimum Variance Selection)</option>
              </select>
            </div>

            {/* Period */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                데이터 기간
              </label>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1mo">1개월</option>
                <option value="3mo">3개월</option>
                <option value="6mo">6개월</option>
                <option value="1y">1년</option>
                <option value="2y">2년</option>
                <option value="5y">5년</option>
              </select>
            </div>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={loading || stocks.length === 0}
            className={`mt-6 w-full py-3 rounded-lg font-semibold text-white transition ${
              loading || stocks.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? '최적화 중...' : '최적화 실행'}
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">최적화 결과</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm text-gray-600">기대 수익률</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(results.expected_return * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <p className="text-sm text-gray-600">위험도</p>
                <p className="text-2xl font-bold text-red-600">
                  {(results.risk * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <p className="text-sm text-gray-600">샤프 비율</p>
                <p className="text-2xl font-bold text-green-600">
                  {results.sharpe_ratio?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>

            {/* Optimized Weights */}
            {results.weights && results.tickers && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">최적화된 비중</h3>
                <div className="grid grid-cols-2 gap-3">
                  {results.tickers.map((ticker, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                      <span className="font-medium text-gray-700">{ticker}</span>
                      <span className="text-indigo-600 font-semibold">
                        {(results.weights[idx] * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
