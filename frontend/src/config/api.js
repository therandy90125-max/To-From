import axios from 'axios';

// 백엔드 URL (환경변수 또는 기본값)
const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log('🔗 Backend URL:', BACKEND_URL);

// API 엔드포인트
export const API_ENDPOINTS = {
  // Stock Search
  STOCK_SEARCH: `${BACKEND_URL}/api/stocks/search`,
  STOCK_INFO: (symbol) => `${BACKEND_URL}/api/stocks/${symbol}`,
  
  // Portfolio Optimization
  OPTIMIZE_PORTFOLIO: `${BACKEND_URL}/api/portfolio/optimize`,
  
  // Currency
  EXCHANGE_RATE: (from, to) => `${BACKEND_URL}/api/currency/rate?from=${from}&to=${to}`,
  
  // Health Check
  BACKEND_HEALTH: `${BACKEND_URL}/actuator/health`,
  STOCK_HEALTH: `${BACKEND_URL}/api/stocks/health`
};

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false  // CORS credentials
});

// 요청 인터셉터 (디버깅)
apiClient.interceptors.request.use(
  config => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (디버깅 + 에러 처리)
apiClient.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.config?.url);
    
    if (error.response) {
      // 서버 응답 에러 (4xx, 5xx)
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      // 요청은 보냈으나 응답 없음 (네트워크 에러)
      console.error('❌ No response from server. Backend not running?');
    } else {
      // 요청 설정 중 에러
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Health check 유틸리티
export const checkBackendHealth = async () => {
  try {
    // 직접 URL 사용 (CORS 문제 방지)
    const healthUrl = `${BACKEND_URL}/actuator/health`;
    console.log('🔍 Checking backend health at:', healthUrl);
    
    // 먼저 간단한 연결 테스트
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('✅ Backend is healthy:', data);
          return true;
        } catch (e) {
          // JSON 파싱 실패해도 상태 코드가 200이면 OK
          console.log('✅ Backend is responding (Status:', response.status, ')');
          return true;
        }
      } else {
        console.error('❌ Backend health check failed - Status:', response.status);
        return false;
      }
    } catch (fetchError) {
      // 네트워크 에러인 경우
      console.error('❌ Backend connection failed:', fetchError.message);
      
      // CORS 에러인 경우 다른 방법 시도
      if (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch')) {
        console.log('⚠️ CORS error detected, trying alternative method...');
        // apiClient를 사용한 재시도
        try {
          const response = await apiClient.get('/actuator/health');
          console.log('✅ Backend is healthy (via apiClient):', response.data);
          return true;
        } catch (apiError) {
          console.error('❌ apiClient also failed:', apiError.message);
          return false;
        }
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
};

export default apiClient;
