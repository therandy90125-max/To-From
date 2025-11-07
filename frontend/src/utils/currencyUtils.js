/**
 * Currency Utilities
 * 통화 변환 및 포맷팅 유틸리티
 */

// Default exchange rate (fallback)
const DEFAULT_USD_TO_KRW = 1300;

// Cache for exchange rate
let cachedExchangeRate = null;
let lastFetchTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch current USD to KRW exchange rate
 * 현재 USD → KRW 환율 가져오기
 */
export async function fetchExchangeRate() {
  // Check cache
  if (cachedExchangeRate && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedExchangeRate;
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 3000
    });
    
    if (response.ok) {
      const data = await response.json();
      const krwRate = data.rates?.KRW;
      
      if (krwRate && krwRate > 1000) {
        cachedExchangeRate = krwRate;
        lastFetchTime = Date.now();
        console.log(`[Currency] Exchange rate updated: 1 USD = ${krwRate.toFixed(2)} KRW`);
        return krwRate;
      }
    }
  } catch (error) {
    console.warn('[Currency] Failed to fetch exchange rate:', error.message);
  }

  // Return cached or default
  if (cachedExchangeRate) {
    return cachedExchangeRate;
  }

  console.log(`[Currency] Using default exchange rate: 1 USD = ${DEFAULT_USD_TO_KRW} KRW`);
  cachedExchangeRate = DEFAULT_USD_TO_KRW;
  lastFetchTime = Date.now();
  return DEFAULT_USD_TO_KRW;
}

/**
 * Get cached exchange rate (synchronous)
 * 캐시된 환율 가져오기 (동기)
 */
export function getCachedExchangeRate() {
  return cachedExchangeRate || DEFAULT_USD_TO_KRW;
}

/**
 * Format currency based on language
 * 언어에 따라 통화 포맷팅
 * 
 * @param {number} amount - Amount in USD
 * @param {string} language - 'ko' or 'en'
 * @param {boolean} showSymbol - Show currency symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, language = 'en', showSymbol = true) {
  const exchangeRate = getCachedExchangeRate();

  if (language === 'ko') {
    // Korean: Show in KRW
    const krwAmount = amount * exchangeRate;
    const formatted = Math.round(krwAmount).toLocaleString('ko-KR');
    return showSymbol ? `₩${formatted}` : formatted;
  } else {
    // English: Show in USD
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return showSymbol ? `$${formatted}` : formatted;
  }
}

/**
 * Get currency symbol based on language
 * 언어에 따른 통화 심볼
 */
export function getCurrencySymbol(language = 'en') {
  return language === 'ko' ? '₩' : '$';
}

/**
 * Get currency code based on language
 * 언어에 따른 통화 코드
 */
export function getCurrencyCode(language = 'en') {
  return language === 'ko' ? 'KRW' : 'USD';
}

/**
 * Convert USD to KRW
 */
export function usdToKrw(usdAmount) {
  return usdAmount * getCachedExchangeRate();
}

/**
 * Convert KRW to USD
 */
export function krwToUsd(krwAmount) {
  return krwAmount / getCachedExchangeRate();
}

/**
 * Initialize exchange rate (call this on app start)
 * 앱 시작 시 환율 초기화
 */
export async function initializeExchangeRate() {
  try {
    await fetchExchangeRate();
  } catch (error) {
    console.warn('[Currency] Failed to initialize exchange rate:', error);
  }
}

// Auto-initialize on module load
initializeExchangeRate();

export default {
  fetchExchangeRate,
  getCachedExchangeRate,
  formatCurrency,
  getCurrencySymbol,
  getCurrencyCode,
  usdToKrw,
  krwToUsd,
  initializeExchangeRate
};

