package com.toandfrom.toandfrom.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.scheduling.annotation.Scheduled;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Currency Conversion Service
 * 통화 변환 서비스
 * 
 * Features:
 * - Real-time USD/KRW exchange rate fetching
 * - Rate caching (1 hour refresh)
 * - Currency conversion between USD and KRW
 */
@Service
public class CurrencyService {
    
    private final RestTemplate restTemplate;
    
    // Cache for exchange rates (in-memory cache)
    private final Map<String, ExchangeRateCache> rateCache = new ConcurrentHashMap<>();
    
    // Default fallback rate
    private static final BigDecimal DEFAULT_USD_TO_KRW = new BigDecimal("1300.0");
    
    // Cache duration: 1 hour in milliseconds
    private static final long CACHE_DURATION_MS = 60 * 60 * 1000;
    
    public CurrencyService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Get exchange rate from USD to target currency
     * USD에서 대상 통화로의 환율 조회
     * 
     * @param from Source currency (e.g., "USD")
     * @param to Target currency (e.g., "KRW")
     * @return Exchange rate (e.g., 1 USD = 1320 KRW)
     */
    public BigDecimal getExchangeRate(String from, String to) {
        String cacheKey = from + "_" + to;
        
        // Check cache
        ExchangeRateCache cached = rateCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.getRate();
        }
        
        // Fetch new rate
        BigDecimal rate = fetchExchangeRateFromAPI(from, to);
        
        // Update cache
        rateCache.put(cacheKey, new ExchangeRateCache(rate));
        
        return rate;
    }
    
    /**
     * Fetch exchange rate from external API
     * 외부 API에서 환율 조회
     */
    private BigDecimal fetchExchangeRateFromAPI(String from, String to) {
        // Try Naver Finance API first (for KRW, more reliable)
        if (from.equals("USD") && to.equals("KRW")) {
            try {
                BigDecimal naverRate = fetchFromNaverFinance();
                if (naverRate != null) {
                    System.out.println("[CurrencyService] Fetched from Naver Finance: 1 USD = " + naverRate + " KRW");
                    return naverRate;
                }
            } catch (Exception e) {
                System.err.println("[CurrencyService] Naver Finance failed: " + e.getMessage());
            }
        }
        
        // Fallback to exchangerate-api.com
        try {
            String url = "https://api.exchangerate-api.com/v4/latest/" + from;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("rates")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> rates = (Map<String, Object>) response.get("rates");
                
                if (rates.containsKey(to)) {
                    Object rateObj = rates.get(to);
                    BigDecimal rate = convertToBigDecimal(rateObj);
                    
                    // Sanity check: KRW should be > 1000
                    if (to.equals("KRW") && rate.compareTo(new BigDecimal("1000")) > 0) {
                        System.out.println("[CurrencyService] Fetched exchange rate: 1 " + from + " = " + rate + " " + to);
                        return rate;
                    } else if (!to.equals("KRW")) {
                        return rate;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[CurrencyService] Failed to fetch exchange rate: " + e.getMessage());
        }
        
        // Fallback to default
        System.out.println("[CurrencyService] Using default exchange rate: 1 USD = " + DEFAULT_USD_TO_KRW + " KRW");
        return DEFAULT_USD_TO_KRW;
    }
    
    /**
     * Fetch USD/KRW rate from Naver Finance
     * 네이버 금융에서 USD/KRW 환율 조회
     */
    private BigDecimal fetchFromNaverFinance() {
        try {
            // Naver Finance USD/KRW 환율 페이지 파싱
            String url = "https://finance.naver.com/marketindex/exchangeDetail.naver?marketindexCd=FX_USDKRW";
            String html = restTemplate.getForObject(url, String.class);
            
            if (html != null) {
                // 환율 값 추출 (간단한 정규식 파싱)
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("현재가[^>]*>([0-9,]+(?:\\.[0-9]+)?)");
                java.util.regex.Matcher matcher = pattern.matcher(html);
                
                if (matcher.find()) {
                    String rateStr = matcher.group(1).replace(",", "");
                    BigDecimal rate = new BigDecimal(rateStr);
                    
                    // Sanity check
                    if (rate.compareTo(new BigDecimal("1000")) > 0 && rate.compareTo(new BigDecimal("2000")) < 0) {
                        return rate;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[CurrencyService] Naver Finance parsing failed: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Convert amount between currencies
     * 통화 간 금액 변환
     * 
     * @param amount Amount to convert
     * @param from Source currency
     * @param to Target currency
     * @return Converted amount
     */
    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (from.equals(to)) {
            return amount;
        }
        
        BigDecimal rate = getExchangeRate(from, to);
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Convert USD to KRW
     * USD를 KRW로 변환
     */
    public BigDecimal usdToKrw(BigDecimal usdAmount) {
        return convert(usdAmount, "USD", "KRW");
    }
    
    /**
     * Convert KRW to USD
     * KRW를 USD로 변환
     */
    public BigDecimal krwToUsd(BigDecimal krwAmount) {
        return convert(krwAmount, "KRW", "USD");
    }
    
    /**
     * Get cached exchange rate (synchronous, no API call)
     * 캐시된 환율 조회 (동기, API 호출 없음)
     */
    public BigDecimal getCachedExchangeRate(String from, String to) {
        String cacheKey = from + "_" + to;
        ExchangeRateCache cached = rateCache.get(cacheKey);
        
        if (cached != null && !cached.isExpired()) {
            return cached.getRate();
        }
        
        // Return default if no cache
        return DEFAULT_USD_TO_KRW;
    }
    
    /**
     * Detect currency from stock symbol
     * 주식 심볼에서 통화 감지
     * 
     * @param symbol Stock symbol (e.g., "AAPL", "005930.KS")
     * @return Currency code ("USD" or "KRW")
     */
    public String detectCurrencyFromSymbol(String symbol) {
        if (symbol == null) {
            return "USD"; // Default
        }
        
        // Korean stocks: ends with .KS or .KQ
        if (symbol.endsWith(".KS") || symbol.endsWith(".KQ")) {
            return "KRW";
        }
        
        // 6-digit numeric: Korean stock code
        if (symbol.matches("^\\d{6}$")) {
            return "KRW";
        }
        
        // Default: US stock
        return "USD";
    }
    
    /**
     * Detect market from stock symbol
     * 주식 심볼에서 시장 감지
     * 
     * @param symbol Stock symbol
     * @return Market name ("KOSPI", "KOSDAQ", "NASDAQ", "NYSE", etc.)
     */
    public String detectMarketFromSymbol(String symbol) {
        if (symbol == null) {
            return "UNKNOWN";
        }
        
        if (symbol.endsWith(".KS")) {
            return "KOSPI";
        } else if (symbol.endsWith(".KQ")) {
            return "KOSDAQ";
        } else if (symbol.matches("^\\d{6}$")) {
            // 6-digit code: assume KOSPI
            return "KOSPI";
        } else {
            // US stock: determine exchange (simplified)
            // In production, you'd query this from a database or API
            return "NASDAQ"; // Default for US stocks
        }
    }
    
    /**
     * Helper: Convert Object to BigDecimal
     */
    private BigDecimal convertToBigDecimal(Object value) {
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        if (value instanceof String) {
            return new BigDecimal((String) value);
        }
        return DEFAULT_USD_TO_KRW;
    }
    
    /**
     * Clear expired cache entries (scheduled task)
     * 만료된 캐시 항목 정리 (스케줄 작업)
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void clearExpiredCache() {
        rateCache.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
    
    /**
     * Inner class for exchange rate cache
     */
    private static class ExchangeRateCache {
        private final BigDecimal rate;
        private final long timestamp;
        
        public ExchangeRateCache(BigDecimal rate) {
            this.rate = rate;
            this.timestamp = System.currentTimeMillis();
        }
        
        public BigDecimal getRate() {
            return rate;
        }
        
        public boolean isExpired() {
            return (System.currentTimeMillis() - timestamp) > CACHE_DURATION_MS;
        }
    }
}


