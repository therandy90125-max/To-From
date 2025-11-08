package com.toandfrom.toandfrom.service;

import com.toandfrom.toandfrom.dto.StockSearchResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StockSearchService {
    
    private static final Logger log = LoggerFactory.getLogger(StockSearchService.class);
    
    private final RestTemplate restTemplate;
    private final CurrencyService currencyService;
    
    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;
    
    // 인기 주식 목록 (캐시용)
    // Note: Will be initialized in constructor after currencyService is injected
    private List<Map<String, String>> POPULAR_STOCKS;
    
    public StockSearchService(RestTemplate restTemplate, CurrencyService currencyService) {
        this.restTemplate = restTemplate;
        this.currencyService = currencyService;
        
        // Initialize popular stocks list (now with currency info)
        this.POPULAR_STOCKS = Arrays.asList(
            createStock("AAPL", "Apple Inc.", "NASDAQ"),
            createStock("GOOGL", "Alphabet Inc. (Google)", "NASDAQ"),
            createStock("MSFT", "Microsoft Corporation", "NASDAQ"),
            createStock("AMZN", "Amazon.com Inc.", "NASDAQ"),
            createStock("TSLA", "Tesla Inc.", "NASDAQ"),
            createStock("META", "Meta Platforms Inc.", "NASDAQ"),
            createStock("NVDA", "NVIDIA Corporation", "NASDAQ"),
            createStock("JPM", "JPMorgan Chase & Co.", "NYSE"),
            createStock("V", "Visa Inc.", "NYSE"),
            createStock("WMT", "Walmart Inc.", "NYSE"),
            createStock("DIS", "The Walt Disney Company", "NYSE"),
            createStock("NFLX", "Netflix Inc.", "NASDAQ"),
            createStock("PYPL", "PayPal Holdings Inc.", "NASDAQ"),
            createStock("INTC", "Intel Corporation", "NASDAQ"),
            createStock("AMD", "Advanced Micro Devices Inc.", "NASDAQ"),
            createStock("BA", "The Boeing Company", "NYSE"),
            createStock("KO", "The Coca-Cola Company", "NYSE"),
            createStock("PFE", "Pfizer Inc.", "NYSE"),
            createStock("NKE", "NIKE Inc.", "NYSE"),
            createStock("MCD", "McDonald's Corporation", "NYSE"),
            // 한국 주식
            createStock("005930.KS", "Samsung Electronics Co., Ltd.", "KRX"),
            createStock("000660.KS", "SK Hynix Inc.", "KRX"),
            createStock("035420.KS", "NAVER Corporation", "KRX"),
            createStock("035720.KS", "Kakao Corporation", "KRX"),
            createStock("051910.KS", "LG Chem Ltd.", "KRX"),
            createStock("006400.KS", "Samsung SDI Co., Ltd.", "KRX"),
            createStock("207940.KS", "Samsung Biologics Co., Ltd.", "KRX"),
            createStock("005380.KS", "Hyundai Motor Company", "KRX"),
            createStock("000270.KS", "Kia Corporation", "KRX"),
            createStock("068270.KS", "Celltrion Inc.", "KRX")
        );
    }
    
    private Map<String, String> createStock(String ticker, String name, String exchange) {
        Map<String, String> stock = new HashMap<>();
        stock.put("ticker", ticker);
        stock.put("name", name);
        stock.put("exchange", exchange);
        stock.put("displayName", ticker + " - " + name);
        
        // Auto-detect currency and market from symbol
        String currency = currencyService.detectCurrencyFromSymbol(ticker);
        String market = currencyService.detectMarketFromSymbol(ticker);
        
        stock.put("currency", currency);
        stock.put("market", market);
        
        return stock;
    }
    
    /**
     * 주식 검색 (Flask API 우선, 배치 가격 조회 사용)
     * 티커 또는 회사명으로 검색
     * 
     * @param query 검색어
     * @return 검색 결과 목록 (DTO 형식, 최대 10개)
     */
    public List<StockSearchResponseDTO> searchStocks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // 1. Flask API에서 검색 시도 (더 많은 주식 데이터)
        try {
            String url = flaskApiUrl + "/api/stocks/search?q=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
            log.info("Searching stocks via Flask API: {}", url);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> flaskResults = (List<Map<String, Object>>) response.getBody();
                
                if (flaskResults != null && !flaskResults.isEmpty()) {
                    // Convert Flask results to DTOs
                    List<StockSearchResponseDTO> results = new ArrayList<>();
                    for (Map<String, Object> stock : flaskResults) {
                        String ticker = (String) stock.get("ticker");
                        String name = (String) stock.get("name");
                        String exchange = (String) stock.get("exchange");
                        
                        if (ticker != null) {
                            StockSearchResponseDTO dto = StockSearchResponseDTO.builder()
                                .symbol(ticker)
                                .name(name != null ? name : ticker)
                                .market(exchange != null ? exchange : StockSearchResponseDTO.detectMarket(ticker))
                                .currency(StockSearchResponseDTO.detectCurrencyFromSymbol(ticker))
                                .currentPrice(BigDecimal.ZERO)
                                .changePercent("0.00%")
                                .changeAmount(BigDecimal.ZERO)
                                .previousClose(BigDecimal.ZERO)
                                .volume(0L)
                                .lastUpdated(LocalDateTime.now())
                                .build();
                            results.add(dto);
                        }
                    }
                    
                    // Enrich with real-time prices
                    enrichWithRealTimePrices(results);
                    
                    log.info("Found {} stocks from Flask API", results.size());
                    return results;
                }
            } else {
                log.warn("Flask API returned non-2xx status: {}", response.getStatusCode());
            }
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.warn("Flask API connection failed (server may not be running at {}): {}", flaskApiUrl, e.getMessage());
            log.info("Falling back to popular stocks list (includes US stocks: AAPL, GOOGL, MSFT, etc.)");
        } catch (Exception e) {
            log.warn("Flask API search failed, falling back to popular stocks: {}", e.getMessage());
            log.debug("Exception details: ", e);
        }
        
        // 2. Fallback: 인기 주식 목록에서 검색
        String queryUpper = query.toUpperCase();
        List<Map<String, String>> matchedStocks = POPULAR_STOCKS.stream()
            .filter(stock -> 
                stock.get("ticker").toUpperCase().contains(queryUpper) ||
                stock.get("name").toUpperCase().contains(queryUpper)
            )
            .limit(10)
            .collect(Collectors.toList());
        
        // Convert to DTO
        List<StockSearchResponseDTO> results = new ArrayList<>();
        for (Map<String, String> stock : matchedStocks) {
            StockSearchResponseDTO dto = convertToDTO(stock);
            results.add(dto);
        }
        
        // Enrich with real-time prices using batch API (more efficient)
        enrichWithRealTimePrices(results);
        
        log.info("Found {} stocks from popular stocks list", results.size());
        return results;
    }
    
    /**
     * Convert Map to StockSearchResponseDTO
     */
    private StockSearchResponseDTO convertToDTO(Map<String, String> stock) {
        String ticker = stock.get("ticker");
        String name = stock.get("name");
        String currency = stock.getOrDefault("currency", StockSearchResponseDTO.detectCurrencyFromSymbol(ticker));
        String market = stock.getOrDefault("market", StockSearchResponseDTO.detectMarket(ticker));
        
        return StockSearchResponseDTO.builder()
            .symbol(ticker)
            .name(name)
            .currency(currency)
            .market(market)
            .currentPrice(BigDecimal.ZERO) // Will be updated by enrichWithRealTimePrice
            .changePercent("0.00%")
            .changeAmount(BigDecimal.ZERO)
            .previousClose(BigDecimal.ZERO)
            .volume(0L)
            .lastUpdated(LocalDateTime.now())
            .build();
    }
    
    /**
     * Enrich search results with real-time prices using batch API
     * 배치 API를 사용하여 검색 결과에 실시간 가격 정보 추가
     * 
     * This is more efficient than calling individual APIs for each stock
     * 각 주식마다 개별 API를 호출하는 것보다 효율적
     */
    private void enrichWithRealTimePrices(List<StockSearchResponseDTO> stocks) {
        if (stocks.isEmpty()) return;
        
        try {
            // Collect symbols
            List<String> symbols = stocks.stream()
                .map(StockSearchResponseDTO::getSymbol)
                .collect(Collectors.toList());
            
            // Batch request to Flask
            Map<String, Object> request = Map.of("symbols", symbols);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                flaskApiUrl + "/api/stock/prices",
                entity,
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                
                @SuppressWarnings("unchecked")
                Map<String, Map<String, Object>> priceData = 
                    (Map<String, Map<String, Object>>) body.get("data");
                
                if (priceData != null) {
                    // Update each stock with real price
                    stocks.forEach(stock -> {
                        Map<String, Object> info = priceData.get(stock.getSymbol());
                        if (info != null) {
                            stock.setCurrentPrice(convertToBigDecimal(info.get("currentPrice")));
                            stock.setCurrency((String) info.get("currency"));
                            stock.setMarket((String) info.get("market"));
                            stock.setChangePercent((String) info.get("changePercent"));
                            stock.setChangeAmount(convertToBigDecimal(info.get("changeAmount")));
                            stock.setPreviousClose(convertToBigDecimal(info.get("previousClose")));
                            
                            Object volumeObj = info.get("volume");
                            if (volumeObj != null) {
                                stock.setVolume(convertToLong(volumeObj));
                            }
                            
                            stock.setLastUpdated(LocalDateTime.now());
                        }
                    });
                }
            }
            
        } catch (Exception e) {
            log.error("Failed to enrich with real-time prices", e);
            // Don't fail the entire request - return with 0.0 prices
            // 전체 요청을 실패시키지 않음 - 0.0 가격으로 반환
        }
    }
    
    /**
     * Fetch real-time price from Flask API for single stock (fallback method)
     * 단일 주식의 실시간 가격 조회 (폴백 메서드)
     */
    private void enrichWithRealTimePrice(StockSearchResponseDTO dto) {
        try {
            String url = flaskApiUrl + "/api/stock/price/" + dto.getSymbol();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                @SuppressWarnings("unchecked")
                Map<String, Object> priceData = (Map<String, Object>) response.get("data");
                
                if (priceData != null) {
                    dto.setCurrentPrice(convertToBigDecimal(priceData.get("currentPrice")));
                    dto.setCurrency((String) priceData.get("currency"));
                    dto.setMarket((String) priceData.get("market"));
                    dto.setChangePercent((String) priceData.get("changePercent"));
                    dto.setChangeAmount(convertToBigDecimal(priceData.get("changeAmount")));
                    dto.setPreviousClose(convertToBigDecimal(priceData.get("previousClose")));
                    
                    Object volumeObj = priceData.get("volume");
                    if (volumeObj != null) {
                        dto.setVolume(convertToLong(volumeObj));
                    }
                    
                    dto.setLastUpdated(LocalDateTime.now());
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch real-time price for " + dto.getSymbol(), e);
            // Keep default values (0.0) if API call fails
        }
    }
    
    /**
     * Helper: Convert Object to BigDecimal
     */
    private BigDecimal convertToBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        if (value instanceof String) {
            try {
                return new BigDecimal((String) value);
            } catch (NumberFormatException e) {
                return BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }
    
    /**
     * Helper: Convert Object to Long
     */
    private Long convertToLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return 0L;
            }
        }
        return 0L;
    }
    
    /**
     * Get single stock info with real-time price
     * 실시간 가격이 포함된 단일 주식 정보 조회
     * 
     * @param symbol 주식 심볼
     * @return 주식 상세 정보 DTO
     */
    public StockSearchResponseDTO getStockInfo(String symbol) {
        try {
            String url = flaskApiUrl + "/api/stock/price/" + symbol;
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                
                if (Boolean.TRUE.equals(body.get("success"))) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    
                    if (data != null) {
                        return StockSearchResponseDTO.builder()
                            .symbol((String) data.get("symbol"))
                            .name((String) data.get("name"))
                            .currentPrice(convertToBigDecimal(data.get("currentPrice")))
                            .currency((String) data.get("currency"))
                            .market((String) data.get("market"))
                            .changePercent((String) data.get("changePercent"))
                            .changeAmount(convertToBigDecimal(data.get("changeAmount")))
                            .previousClose(convertToBigDecimal(data.get("previousClose")))
                            .volume(convertToLong(data.get("volume")))
                            .lastUpdated(LocalDateTime.now())
                            .build();
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("Failed to get stock info for " + symbol, e);
        }
        
        // Fallback: Check popular stocks list
        Optional<Map<String, String>> stock = POPULAR_STOCKS.stream()
            .filter(s -> s.get("ticker").equalsIgnoreCase(symbol))
            .findFirst();
        
        if (stock.isPresent()) {
            StockSearchResponseDTO dto = convertToDTO(stock.get());
            enrichWithRealTimePrice(dto);
            return dto;
        }
        
        return null;
    }
}

