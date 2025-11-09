import axios from 'axios';

// API Base URLs - 프록시를 통해 Spring Boot로 전달됨
const PORTFOLIO_API_URL = '/api/portfolio';
const STOCKS_API_URL = '/api/stocks';
const QUANTUM_API_URL = '/api';

/**
 * 포트폴리오 최적화 (초기 가중치 없이)
 */
export const optimizePortfolio = async (inputData) => {
  try {
    const response = await axios.post(`${PORTFOLIO_API_URL}/optimize`, inputData);
    return response.data;
  } catch (error) {
    console.error('Portfolio optimization failed:', error);
    throw error;
  }
};

/**
 * 포트폴리오 최적화 (초기 가중치 포함)
 * TEMPORARY: Flask 직접 호출 (Backend 우회)
 */
export const optimizePortfolioWithWeights = async (inputData) => {
  try {
    console.log('[DEBUG] Calling Flask directly (bypassing Backend)');
    console.log('[DEBUG] Request data:', inputData);
    
    // Flask로 직접 요청 - Qiskit QAOA 양자 최적화
    // ✅ method를 'quantum'으로 강제하여 Qiskit QAOA 사용 보장
    const method = inputData.method || 'quantum';
    
    if (method !== 'quantum') {
      console.warn('[portfolioApi] ⚠️ Method is not "quantum", forcing to quantum for Qiskit QAOA');
    }
    
    console.log('[portfolioApi] 🚀 Calling Flask API for Qiskit QAOA optimization');
    console.log('[portfolioApi] Method:', method);
    console.log('[portfolioApi] Tickers:', inputData.tickers);
    console.log('[portfolioApi] Reps (QAOA layers):', inputData.reps || 1);
    console.log('[portfolioApi] Precision (bits per asset):', inputData.precision || 4);
    
    // Flask 서버 URL (환경 변수 또는 기본값)
    const FLASK_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || import.meta.env.VITE_FLASK_URL || 'http://localhost:5000';
    console.log('[portfolioApi] Flask URL:', FLASK_URL);
    
    const response = await axios.post(`${FLASK_URL}/api/optimize/with-weights`, {
      tickers: inputData.tickers,
      initial_weights: inputData.initialWeights || inputData.weights,
      risk_factor: inputData.riskFactor || 0.5,
      method: 'quantum',  // ✅ Qiskit QAOA 강제
      period: inputData.period || '1y',
      reps: inputData.reps || 1,  // QAOA layers
      precision: inputData.precision || 4,  // Binary encoding precision
      fast_mode: inputData.fast_mode !== false  // Fast mode for QAOA
    }, {
      timeout: 120000  // 2분 타임아웃 (Qiskit QAOA는 시간이 걸릴 수 있음)
    });
    
    console.log('[SUCCESS] Flask response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('[ERROR] Flask direct call failed:', error);
    
    // Fallback: Backend 시도
    console.log('[FALLBACK] Trying Backend...');
    try {
      const backendResponse = await axios.post(`${PORTFOLIO_API_URL}/optimize/with-weights`, inputData);
      return backendResponse.data;
    } catch (backendError) {
      console.error('[ERROR] Backend also failed:', backendError);
      throw error;
    }
  }
};

/**
 * Quantum 최적화 (비동기 워크플로우)
 */
export const optimizeQuantumWorkflow = async (inputData) => {
  try {
    const response = await axios.post(`${PORTFOLIO_API_URL}/optimize/workflow`, inputData, {
      timeout: 300000, // 5 minutes for quantum optimization
    });
    return response.data;
  } catch (error) {
    console.error('Quantum workflow optimization failed:', error);
    throw error;
  }
};

/**
 * 워크플로우 상태 확인
 */
export const getWorkflowStatus = async (workflowId) => {
  try {
    const response = await axios.get(`${PORTFOLIO_API_URL}/workflow/${workflowId}/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflow status:', error);
    throw error;
  }
};

/**
 * 주식 가격 조회
 */
export const getStockPrice = async (symbol) => {
  try {
    const response = await axios.get(`${STOCKS_API_URL}/price/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stock price:', error);
    throw error;
  }
};

/**
 * 주식 검색 (글로벌 + 한국)
 * Backend: GET /api/stocks/search?query=AAPL
 */
export const searchStocks = async (query) => {
  try {
    const response = await axios.get(`${STOCKS_API_URL}/search`, {
      params: { query: query }  // 파라미터 이름: 'query'
    });
    return response.data;
  } catch (error) {
    console.error('Stock search failed:', error);
    throw error;
  }
};

/**
 * 포트폴리오 메트릭 계산
 */
export const calculatePortfolioMetrics = async (portfolioData) => {
  try {
    const response = await axios.post(`${PORTFOLIO_API_URL}/metrics`, portfolioData);
    return response.data;
  } catch (error) {
    console.error('Failed to calculate portfolio metrics:', error);
    throw error;
  }
};

/**
 * 히스토리컬 데이터 가져오기
 */
export const getHistoricalData = async (symbols, period = '1y') => {
  try {
    const response = await axios.post(`${STOCKS_API_URL}/historical`, {
      symbols,
      period
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    throw error;
  }
};

export default {
  optimizePortfolio,
  optimizePortfolioWithWeights,
  optimizeQuantumWorkflow,
  getWorkflowStatus,
  getStockPrice,
  searchStocks,
  calculatePortfolioMetrics,
  getHistoricalData
};
