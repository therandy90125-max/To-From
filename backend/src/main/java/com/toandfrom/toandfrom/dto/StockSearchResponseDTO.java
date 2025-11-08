package com.toandfrom.toandfrom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for stock search results with multi-market support
 * Supports both US (NYSE/NASDAQ) and Korean (KOSPI/KOSDAQ) markets
 * 
 * 다중 시장 지원 주식 검색 결과 DTO
 * 미국 (NYSE/NASDAQ) 및 한국 (KOSPI/KOSDAQ) 시장 지원
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockSearchResponseDTO {
    
    /**
     * Stock symbol (e.g., "AAPL" for US, "005930.KS" for Samsung)
     * 주식 심볼 (예: "AAPL" - 미국, "005930.KS" - 삼성전자)
     */
    private String symbol;
    
    /**
     * Company name (e.g., "Apple Inc.", "삼성전자")
     * 회사명 (예: "Apple Inc.", "삼성전자")
     */
    private String name;
    
    /**
     * Current stock price (real-time or delayed 15min)
     * 현재 주가 (실시간 또는 15분 지연)
     */
    private BigDecimal currentPrice;
    
    /**
     * Currency code: "USD" or "KRW"
     * 통화 코드: "USD" 또는 "KRW"
     */
    private String currency;
    
    /**
     * Market identifier: "NYSE", "NASDAQ", "KOSPI", "KOSDAQ"
     * 시장 식별자: "NYSE", "NASDAQ", "KOSPI", "KOSDAQ"
     */
    private String market;
    
    /**
     * Price change percentage (e.g., "+2.5%", "-1.3%")
     * 가격 변동률 (예: "+2.5%", "-1.3%")
     */
    private String changePercent;
    
    /**
     * Price change amount (e.g., +1.50, -0.75)
     * 가격 변동액 (예: +1.50, -0.75)
     */
    private BigDecimal changeAmount;
    
    /**
     * Previous close price
     * 전일 종가
     */
    private BigDecimal previousClose;
    
    /**
     * Last update timestamp
     * 마지막 업데이트 시간
     */
    private LocalDateTime lastUpdated;
    
    /**
     * Trading volume
     * 거래량
     */
    private Long volume;
    
    /**
     * Market cap (optional)
     * 시가총액 (선택사항)
     */
    private BigDecimal marketCap;
    
    /**
     * Helper method to detect market from symbol
     * 심볼에서 시장 감지 헬퍼 메서드
     */
    public static String detectMarket(String symbol) {
        if (symbol == null) {
            return "UNKNOWN";
        }
        if (symbol.endsWith(".KS")) return "KOSPI";
        if (symbol.endsWith(".KQ")) return "KOSDAQ";
        if (symbol.matches("^[A-Z]{1,5}$")) return "NYSE/NASDAQ"; // Simple US stock pattern
        return "UNKNOWN";
    }
    
    /**
     * Helper method to detect currency from market
     * 시장에서 통화 감지 헬퍼 메서드
     */
    public static String detectCurrency(String market) {
        if (market == null) {
            return "USD"; // Default
        }
        if (market.contains("KOS")) return "KRW";
        return "USD";
    }
    
    /**
     * Helper method to detect currency from symbol
     * 심볼에서 통화 감지 헬퍼 메서드
     */
    public static String detectCurrencyFromSymbol(String symbol) {
        String market = detectMarket(symbol);
        return detectCurrency(market);
    }
}
