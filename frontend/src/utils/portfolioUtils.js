/**
 * Portfolio Utility Functions
 * 포트폴리오 관련 유틸리티 함수
 */

/**
 * 티커 문자열을 배열로 파싱
 * @param {string} tickersString - "AAPL,GOOGL,MSFT"
 * @returns {Array<string>} - ["AAPL", "GOOGL", "MSFT"]
 */
export const parseTickers = (tickersString) => {
  if (!tickersString) return [];
  
  return tickersString
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
};

/**
 * 가중치 문자열을 배열로 파싱
 * @param {string} weightsString - "0.4,0.3,0.3"
 * @returns {Array<number>} - [0.4, 0.3, 0.3]
 */
export const parseWeights = (weightsString) => {
  if (!weightsString) return [];
  
  return weightsString
    .split(',')
    .map(w => parseFloat(w.trim()))
    .filter(w => !isNaN(w));
};

/**
 * 티커 유효성 검증
 * @param {Array<string>} tickers
 * @returns {Object} { isValid, error }
 */
export const validateTickers = (tickers) => {
  if (!Array.isArray(tickers) || tickers.length === 0) {
    return {
      isValid: false,
      error: '최소 하나의 주식 티커를 입력해주세요.'
    };
  }

  if (tickers.length > 20) {
    return {
      isValid: false,
      error: '최대 20개의 주식만 입력 가능합니다.'
    };
  }

  return { isValid: true, error: null };
};

/**
 * 가중치 유효성 검증
 * @param {Array<number>} weights
 * @param {Array<string>} tickers
 * @returns {Object} { isValid, error }
 */
export const validateWeights = (weights, tickers) => {
  if (!Array.isArray(weights)) {
    return {
      isValid: false,
      error: '가중치가 올바르지 않습니다.'
    };
  }

  if (weights.length !== tickers.length) {
    return {
      isValid: false,
      error: `가중치 개수(${weights.length})가 티커 개수(${tickers.length})와 일치하지 않습니다.`
    };
  }

  const sum = weights.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.01) {
    return {
      isValid: false,
      error: `가중치 합계가 1.0이어야 합니다. 현재: ${sum.toFixed(4)}`
    };
  }

  return { isValid: true, error: null };
};

/**
 * 한국 주식 심볼인지 확인
 * @param {string} ticker
 * @returns {boolean}
 */
export const isKoreanStock = (ticker) => {
  // 6자리 숫자 또는 .KS/.KQ로 끝나는 경우
  return /^\d{6}$/.test(ticker) || 
         ticker.endsWith('.KS') || 
         ticker.endsWith('.KQ');
};

/**
 * 한국 주식 심볼 정규화
 * @param {string} ticker - "005930" or "005930.KS"
 * @returns {string} - "005930.KS"
 */
export const normalizeKoreanStock = (ticker) => {
  if (/^\d{6}$/.test(ticker)) {
    return `${ticker}.KS`;
  }
  return ticker;
};

/**
 * 리스크 레벨 텍스트 반환
 * @param {number} riskFactor - 0.0 ~ 1.0
 * @returns {string}
 */
export const getRiskLevelText = (riskFactor) => {
  if (riskFactor < 0.3) return '공격적';
  if (riskFactor < 0.7) return '균형';
  return '보수적';
};

/**
 * 최적화 방법 텍스트 반환
 * @param {string} method - "quantum" or "classical"
 * @returns {string}
 */
export const getMethodText = (method) => {
  return method === 'quantum' ? '양자 (QAOA)' : '고전적';
};

/**
 * 기간 텍스트 반환
 * @param {string} period - "1mo", "3mo", "6mo", "1y", etc.
 * @returns {string}
 */
export const getPeriodText = (period) => {
  const periodMap = {
    '1mo': '1개월',
    '3mo': '3개월',
    '6mo': '6개월',
    '1y': '1년',
    '2y': '2년',
    '5y': '5년',
  };
  return periodMap[period] || period;
};

/**
 * 숫자를 퍼센트로 포맷
 * @param {number} value - 0.15
 * @param {number} decimals - 2
 * @returns {string} - "15.00%"
 */
export const formatPercent = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 숫자를 화폐 형식으로 포맷
 * @param {number} value
 * @param {string} currency - "KRW" or "USD"
 * @returns {string}
 */
export const formatCurrency = (value, currency = 'KRW') => {
  if (currency === 'KRW') {
    return `₩${value.toLocaleString('ko-KR')}`;
  } else {
    return `$${value.toLocaleString('en-US')}`;
  }
};

/**
 * 샤프 비율 평가 텍스트
 * @param {number} sharpeRatio
 * @returns {string}
 */
export const getSharpeRatioText = (sharpeRatio) => {
  if (sharpeRatio < 0) return '매우 낮음';
  if (sharpeRatio < 0.5) return '낮음';
  if (sharpeRatio < 1.0) return '보통';
  if (sharpeRatio < 2.0) return '좋음';
  return '매우 좋음';
};

export default {
  parseTickers,
  parseWeights,
  validateTickers,
  validateWeights,
  isKoreanStock,
  normalizeKoreanStock,
  getRiskLevelText,
  getMethodText,
  getPeriodText,
  formatPercent,
  formatCurrency,
  getSharpeRatioText,
};

