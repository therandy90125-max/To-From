package com.toandfrom.toandfrom.client;

import com.toandfrom.toandfrom.entity.Stock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * yfinance API 클라이언트
 * Flask 백엔드를 통해 yfinance 데이터 조회
 */
@Component
public class YFinanceClient {
    
    private static final Logger log = LoggerFactory.getLogger(YFinanceClient.class);
    
    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;
    
    private final RestTemplate restTemplate;
    
    public YFinanceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * yfinance를 사용하여 주식 검색
     * 
     * @param query 검색어
     * @param market 마켓 (KR, US, ALL)
     * @return 검색 결과 목록 (Stock 형식)
     */
    public List<Stock> search(String query, String market) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Stock> results = new ArrayList<>();
        
        try {
            // Flask API를 통해 yfinance 검색
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = flaskApiUrl + "/api/stocks/search?q=" + encodedQuery;
            
            log.debug("YFinance search request: {}", url);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = 
                restTemplate.getForEntity(url, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                if (body == null) {
                    return results;
                }
                
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> stockList = 
                    (List<Map<String, Object>>) body.get("data");
                
                if (stockList == null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> resultsList = 
                        (List<Map<String, Object>>) body.get("results");
                    stockList = resultsList;
                }
                
                if (stockList != null) {
                    for (Map<String, Object> stockData : stockList) {
                        Stock stock = convertToStock(stockData, market);
                        if (stock != null) {
                            results.add(stock);
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            log.warn("YFinance search failed for query '{}': {}", query, e.getMessage());
            log.debug("YFinance search error details: ", e);
        }
        
        return results;
    }
    
    /**
     * Flask API 응답을 Stock으로 변환
     */
    private Stock convertToStock(Map<String, Object> stockData, String market) {
        try {
            String symbol = (String) stockData.get("ticker");
            if (symbol == null) {
                symbol = (String) stockData.get("symbol");
            }
            
            if (symbol == null) {
                return null;
            }
            
            String name = (String) stockData.get("name");
            if (name == null) {
                name = (String) stockData.get("companyName");
            }
            
            String nameKo = (String) stockData.get("name_ko");
            if (nameKo == null) {
                nameKo = (String) stockData.get("nameKo");
            }
            
            // 마켓 자동 감지
            String detectedMarket = market;
            if (detectedMarket == null || "ALL".equals(detectedMarket)) {
                if (symbol.matches("\\d{6}(\\.KS|\\.KQ)?")) {
                    detectedMarket = "KR";
                } else {
                    detectedMarket = "US";
                }
            }
            
            // ID 생성: kr_005930 또는 us_aapl
            String id = detectedMarket.toLowerCase() + "_" + symbol.replace(".KS", "").replace(".KQ", "").toLowerCase();
            
            Stock stock = new Stock();
            stock.setId(id);
            stock.setSymbol(symbol);
            stock.setName(name != null ? name : symbol);
            stock.setNameKo(nameKo);
            stock.setMarket(detectedMarket);
            stock.setType(detectType(stockData));
            stock.setExchange((String) stockData.get("exchange"));
            stock.setSector((String) stockData.get("sector"));
            stock.setIsActive(true);
            stock.setLastVerified(LocalDateTime.now());
            stock.setSource("YFINANCE");
            
            return stock;
            
        } catch (Exception e) {
            log.warn("Failed to convert stock data to Stock: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 주식 타입 감지 (STOCK, ETF)
     */
    private String detectType(Map<String, Object> stockData) {
        String type = (String) stockData.get("type");
        if (type != null) {
            return type.toUpperCase();
        }
        
        String assetType = (String) stockData.get("asset_type");
        if (assetType != null) {
            return assetType.toUpperCase();
        }
        
        // 기본값: STOCK
        return "STOCK";
    }
}

