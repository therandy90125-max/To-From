package com.toandfrom.toandfrom.client;

import com.toandfrom.toandfrom.entity.Stock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * SEC Edgar API 클라이언트
 * 미국 상장 회사 목록 조회
 * 
 * SEC Edgar Company Tickers JSON: https://www.sec.gov/files/company_tickers.json
 * 
 * Note: SEC API는 User-Agent 헤더가 필수입니다.
 */
@Component
public class SECClient {
    
    private static final Logger log = LoggerFactory.getLogger(SECClient.class);
    
    private static final String SEC_API_URL = "https://www.sec.gov/files/company_tickers.json";
    
    private final RestTemplate restTemplate;
    private final AlphaVantageClient alphaVantageClient;
    
    public SECClient(RestTemplate restTemplate, AlphaVantageClient alphaVantageClient) {
        this.restTemplate = restTemplate;
        this.alphaVantageClient = alphaVantageClient;
    }
    
    /**
     * SEC에서 실시간 상장사 데이터 조회
     * 
     * @return 상장 종목 목록
     */
    public List<Stock> getListedStocks() {
        List<Stock> stocks = new ArrayList<>();
        
        // 1. SEC Edgar API 시도
        try {
            stocks = fetchFromSECApi();
            if (!stocks.isEmpty()) {
                log.info("✅ SEC API에서 {}개 종목 조회 성공", stocks.size());
                return stocks;
            }
        } catch (Exception e) {
            log.warn("⚠️ SEC API 호출 실패, Alpha Vantage로 폴백: {}", e.getMessage());
            log.debug("SEC API error details: ", e);
        }
        
        // 2. Alpha Vantage 폴백 (주요 주식만)
        try {
            stocks = fetchFromAlphaVantage();
            if (!stocks.isEmpty()) {
                log.info("✅ Alpha Vantage에서 {}개 종목 조회 성공 (폴백)", stocks.size());
                return stocks;
            }
        } catch (Exception e) {
            log.warn("⚠️ Alpha Vantage 호출 실패: {}", e.getMessage());
            log.debug("Alpha Vantage error details: ", e);
        }
        
        log.warn("❌ 모든 API 호출 실패, 빈 목록 반환");
        return stocks;
    }
    
    /**
     * SEC Edgar API에서 상장 종목 조회
     */
    private List<Stock> fetchFromSECApi() {
        try {
            // SEC API는 User-Agent 헤더 필수
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "ToAndFrom Portfolio Optimizer (contact@example.com)");
            
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            log.debug("SEC API request: {}", SEC_API_URL);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                SEC_API_URL,
                HttpMethod.GET,
                entity,
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = response.getBody();
                
                if (data == null) {
                    return new ArrayList<>();
                }
                
                // JSON 파싱 및 Stock 객체로 변환
                List<Stock> stocks = new ArrayList<>();
                LocalDateTime now = LocalDateTime.now();
                
                for (Object entry : data.values()) {
                    if (entry instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> company = (Map<String, Object>) entry;
                        
                        String ticker = (String) company.get("ticker");
                        String title = (String) company.get("title");
                        
                        if (ticker == null || ticker.trim().isEmpty()) {
                            continue;
                        }
                        
                        // Stock 생성
                        Stock stock = new Stock();
                        stock.setId("us_" + ticker.toLowerCase());
                        stock.setSymbol(ticker);
                        stock.setName(title != null ? title.trim() : ticker);
                        stock.setMarket("US");
                        stock.setType("STOCK");
                        stock.setIsActive(true);
                        stock.setLastVerified(now);
                        stock.setSource("SEC");
                        
                        // CIK (Central Index Key) 저장 (선택사항)
                        Object cik = company.get("cik_str");
                        if (cik != null) {
                            // CIK를 exchange 필드에 임시 저장 (필요시 별도 필드 추가)
                            stock.setExchange("CIK:" + cik.toString());
                        }
                        
                        stocks.add(stock);
                    }
                }
                
                log.info("SEC API에서 {}개 회사 데이터 파싱 완료", stocks.size());
                return stocks;
            }
            
        } catch (Exception e) {
            log.error("❌ SEC API 호출 실패", e);
            throw e;
        }
        
        return new ArrayList<>();
    }
    
    /**
     * Alpha Vantage API에서 주요 주식 조회 (폴백)
     */
    private List<Stock> fetchFromAlphaVantage() {
        List<Stock> stocks = new ArrayList<>();
        
        try {
            // 주요 주식 심볼 목록
            List<String> popularSymbols = List.of(
                "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA",
                "JPM", "V", "WMT", "DIS", "NFLX", "PYPL", "INTC", "AMD",
                "BA", "KO", "PFE", "NKE", "MCD", "SPY", "QQQ", "VOO"
            );
            
            LocalDateTime now = LocalDateTime.now();
            
            for (String symbol : popularSymbols) {
                try {
                    List<AlphaVantageClient.AlphaVantageSearchResult> results = 
                        alphaVantageClient.searchSymbol(symbol);
                    
                    for (AlphaVantageClient.AlphaVantageSearchResult result : results) {
                        if (symbol.equals(result.getSymbol())) {
                            Stock stock = new Stock();
                            stock.setId("us_" + symbol.toLowerCase());
                            stock.setSymbol(symbol);
                            stock.setName(result.getName());
                            stock.setMarket("US");
                            stock.setType(result.getType() != null ? result.getType().toUpperCase() : "STOCK");
                            stock.setIsActive(true);
                            stock.setLastVerified(now);
                            stock.setSource("ALPHA_VANTAGE");
                            stocks.add(stock);
                            break;
                        }
                    }
                } catch (Exception e) {
                    log.debug("Failed to fetch {}: {}", symbol, e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.warn("Alpha Vantage 폴백 실패: {}", e.getMessage());
            log.debug("Alpha Vantage error details: ", e);
        }
        
        return stocks;
    }
}

