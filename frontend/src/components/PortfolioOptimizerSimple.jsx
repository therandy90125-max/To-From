import React, { useState } from 'react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import axios from 'axios';

const PortfolioOptimizerSimple = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 주식 검색 함수 (백엔드 연동)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // API 엔드포인트는 전체 URL이므로, 상대 경로만 사용
      const response = await apiClient.get('/api/stocks/search', {
        params: { q: searchQuery }
      });
      
      console.log('Search results:', response.data);
      
      if (response.data.success && response.data.results) {
        setSearchResults(response.data.results);
      } else {
        setSearchResults([]);
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setError('주식 검색에 실패했습니다. 백엔드 연결을 확인하세요.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 주식 선택 함수
  const handleSelectStock = (stock) => {
    // 중복 방지
    if (selectedStocks.find(s => s.symbol === stock.symbol)) {
      alert('이미 추가된 주식입니다.');
      return;
    }
    
    setSelectedStocks([...selectedStocks, {
      ...stock,
      quantity: 1  // 기본 수량
    }]);
  };

  // 포트폴리오 최적화 함수 (백엔드 연동)
  const handleOptimize = async () => {
    if (selectedStocks.length === 0) {
      alert('최소 1개 이상의 주식을 선택하세요.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        tickers: selectedStocks.map(s => s.symbol),
        risk_factor: 0.5,
        method: 'quantum',  // 또는 'classical'
        period: '1y'
      };
      
      console.log('Optimization request:', payload);
      
      const response = await apiClient.post(API_ENDPOINTS.OPTIMIZE_PORTFOLIO, payload);
      
      console.log('Optimization result:', response.data);
      
      if (response.data.success) {
        alert('최적화 완료! 결과를 확인하세요.');
        console.log('Result:', response.data.result);
      } else {
        setError(response.data.error || '최적화에 실패했습니다.');
      }
      
    } catch (err) {
      console.error('Optimization error:', err);
      
      // Spring Boot 실패 시 Flask로 fallback
      if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
        console.log('⚠️ Spring Boot 연결 실패, Flask로 직접 연결 시도...');
        try {
          const flaskResponse = await axios.post('http://localhost:5000/api/portfolio/optimize', {
            tickers: selectedStocks.map(s => s.symbol),
            risk_factor: 0.5,
            method: 'quantum',
            period: '1y'
          });
          
          if (flaskResponse.data.success) {
            alert('최적화 완료! (Flask 사용)');
            console.log('Flask Result:', flaskResponse.data.result);
          } else {
            setError(flaskResponse.data.error || '최적화에 실패했습니다.');
          }
        } catch (flaskError) {
          console.error('❌ Flask 연결도 실패:', flaskError);
          setError('백엔드 서비스를 사용할 수 없습니다. Flask (포트 5000) 또는 Spring Boot (포트 8080)를 시작하세요.');
        }
      } else {
        setError(err.response?.data?.error || err.message || '포트폴리오 최적화에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">QuantaFolio Navigator</h1>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 주식 검색 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">주식 검색</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="종목명 또는 심볼 (예: AAPL, 삼성전자, 005930.KS)"
            className="flex-1 px-4 py-2 border rounded"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
        
        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="mt-4 border rounded p-4">
            <h3 className="font-semibold mb-2">검색 결과</h3>
            {searchResults.map((stock, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <span className="font-medium">{stock.symbol}</span>
                  <span className="text-gray-600 ml-2">{stock.name}</span>
                  <span className="text-sm ml-2">
                    {stock.currentPrice && stock.currentPrice > 0 
                      ? `${stock.currency || 'USD'} ${stock.currentPrice.toLocaleString()}`
                      : '가격 정보 없음'}
                  </span>
                </div>
                <button
                  onClick={() => handleSelectStock(stock)}
                  className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  추가
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 선택된 포트폴리오 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">내 포트폴리오</h2>
        {selectedStocks.length === 0 ? (
          <p className="text-gray-500">주식을 추가하세요.</p>
        ) : (
          <div className="border rounded p-4">
            {selectedStocks.map((stock, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <span className="font-medium">{stock.symbol}</span>
                  <span className="text-gray-600 ml-2">{stock.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={stock.quantity}
                    onChange={(e) => {
                      const updated = [...selectedStocks];
                      updated[idx].quantity = parseInt(e.target.value) || 1;
                      setSelectedStocks(updated);
                    }}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => {
                      setSelectedStocks(selectedStocks.filter((_, i) => i !== idx));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 최적화 버튼 */}
      <button
        onClick={handleOptimize}
        disabled={loading || selectedStocks.length === 0}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold"
      >
        {loading ? '최적화 중...' : '🚀 양자 알고리즘으로 최적화하기'}
      </button>
    </div>
  );
};

export default PortfolioOptimizerSimple;
