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
  OPTIMIZE_WITH_WEIGHTS: `${BACKEND_URL}/api/portfolio/optimize/with-weights`,
  
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

// Health check 유틸리티 (개선된 버전)
export const checkBackendHealth = async () => {
  const healthEndpoints = [
    `${BACKEND_URL}/actuator/health`,
    `${BACKEND_URL}/api/portfolio/health/flask`,
    `${BACKEND_URL}/api/stocks/health`
  ];
  
  console.log('🔍 Checking backend health...');
  console.log('📍 Backend URL:', BACKEND_URL);
  
  // 여러 엔드포인트 시도
  for (const healthUrl of healthEndpoints) {
    try {
      console.log(`🔍 Trying: ${healthUrl}`);
      
      // 타임아웃을 위한 AbortController 사용 (호환성 개선)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('✅ Backend is healthy:', healthUrl, data);
          return true;
        } catch (e) {
          // JSON 파싱 실패해도 상태 코드가 200이면 OK
          console.log('✅ Backend is responding:', healthUrl, 'Status:', response.status);
          return true;
        }
      } else {
        console.warn(`⚠️ ${healthUrl} returned status:`, response.status);
      }
    } catch (fetchError) {
      // 네트워크 에러인 경우 다음 엔드포인트 시도
      if (fetchError.name === 'AbortError') {
        console.warn(`⏱️ Timeout for ${healthUrl}`);
      } else {
        console.warn(`❌ Failed to connect to ${healthUrl}:`, fetchError.message);
      }
      continue;
    }
  }
  
  // 모든 엔드포인트 실패 시 apiClient로 재시도
  console.log('⚠️ Direct fetch failed, trying apiClient...');
  try {
    const response = await apiClient.get('/actuator/health', { timeout: 5000 });
    console.log('✅ Backend is healthy (via apiClient):', response.data);
    return true;
  } catch (apiError) {
    console.error('❌ All health check methods failed');
    console.error('Error details:', apiError.message);
    
    // 상세한 에러 정보 출력
    if (apiError.code === 'ECONNREFUSED' || apiError.message.includes('Network Error')) {
      console.error('💡 백엔드 서버가 실행 중이지 않을 수 있습니다.');
      console.error('💡 다음 명령어로 서버를 시작하세요:');
      console.error('   - PowerShell: .\\start-dev.ps1');
      console.error('   - 또는 백엔드 디렉토리에서: .\\mvnw.cmd spring-boot:run');
    } else if (apiError.message.includes('timeout')) {
      console.error('💡 백엔드 서버 응답이 너무 느립니다.');
    } else if (apiError.message.includes('CORS')) {
      console.error('💡 CORS 설정 문제일 수 있습니다.');
    }
    
    return false;
  }
};

export default apiClient;
