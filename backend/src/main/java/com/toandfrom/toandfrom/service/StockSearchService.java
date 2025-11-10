package com.toandfrom.toandfrom.service;

import com.toandfrom.toandfrom.client.AlphaVantageClient;
import com.toandfrom.toandfrom.dto.StockSearchResponseDTO;
import com.toandfrom.toandfrom.entity.Stock;
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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class StockSearchService {
    
    private static final Logger log = LoggerFactory.getLogger(StockSearchService.class);
    
    private final RestTemplate restTemplate;
    private final CurrencyService currencyService;
    private final AlphaVantageClient alphaVantageClient;
    private final YFinanceFallbackService yFinanceFallbackService;
    private final StockCacheService stockCacheService;
    private final ExecutorService executorService;
    
    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;
    
    // 인기 주식 목록 (캐시용)
    // Note: Will be initialized in constructor after currencyService is injected
    private List<Map<String, String>> POPULAR_STOCKS;
    
    public StockSearchService(
            RestTemplate restTemplate, 
            CurrencyService currencyService,
            AlphaVantageClient alphaVantageClient,
            YFinanceFallbackService yFinanceFallbackService,
            StockCacheService stockCacheService) {
        this.restTemplate = restTemplate;
        this.currencyService = currencyService;
        this.alphaVantageClient = alphaVantageClient;
        this.yFinanceFallbackService = yFinanceFallbackService;
        this.stockCacheService = stockCacheService;
        this.executorService = Executors.newFixedThreadPool(5);
        
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
     * @param market 시장 필터 (KR/US/ALL)
     * @return 검색 결과 목록 (DTO 형식, 최대 10개)
     */
    public List<StockSearchResponseDTO> searchStocks(String query, String market) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // market 파라미터 정규화
        if (market == null) {
            market = "ALL";
        }
        market = market.toUpperCase();
        
        log.info("Stock search: query='{}', market='{}'", query, market);
        
        List<StockSearchResponseDTO> results = new ArrayList<>();
        
        // 0. 캐시에서 먼저 검색 (빠른 응답)
        List<Stock> cachedResults = stockCacheService.searchFromCache(query, market);
        if (!cachedResults.isEmpty()) {
            log.info("Found {} stocks from cache", cachedResults.size());
            for (Stock cached : cachedResults) {
                StockSearchResponseDTO dto = convertStockToDTO(cached);
                if (dto != null) {
                    results.add(dto);
                }
            }
            // 캐시에서 충분한 결과를 찾았으면 반환 (최대 10개)
            if (results.size() >= 10) {
                return results.stream().limit(10).collect(Collectors.toList());
            }
        }
        
        // 1. 한국 주식 검색 (market == "KR" 또는 "ALL")
        if ("KR".equals(market) || "ALL".equals(market)) {
            List<StockSearchResponseDTO> koreanResults = searchKoreanStocks(query);
            results.addAll(koreanResults);
        }
        
        // 2. 미국 주식 검색 (market == "US" 또는 "ALL")
        if ("US".equals(market) || "ALL".equals(market)) {
            List<StockSearchResponseDTO> usResults = searchUsStocks(query);
            results.addAll(usResults);
        }
        
        // 3. 중복 제거 및 정렬 (매치 스코어 기준)
        results = deduplicateAndSort(results);
        
        // 4. 실시간 가격 정보 추가
        enrichWithRealTimePrices(results);
        
        log.info("Total search results: {} stocks found", results.size());
        return results;
    }
    
    /**
     * 한국 주식 검색
     * 1. 캐시에서 먼저 검색 (빠른 응답)
     * 2. Flask API 검색 (추가 결과)
     * 3. yfinance 폴백 (6자리 코드)
     */
    private List<StockSearchResponseDTO> searchKoreanStocks(String query) {
        List<StockSearchResponseDTO> results = new ArrayList<>();
        
        // 1. 캐시에서 한국 주식 검색 (이미 searchStocks에서 처리되지만, 여기서도 확인)
        List<Stock> cachedResults = stockCacheService.searchFromCache(query, "KR");
        if (!cachedResults.isEmpty()) {
            log.debug("Found {} Korean stocks from cache", cachedResults.size());
            for (Stock cached : cachedResults) {
                StockSearchResponseDTO dto = convertStockToDTO(cached);
                if (dto != null) {
                    results.add(dto);
                }
            }
            // 캐시에서 충분한 결과를 찾았으면 Flask API 호출 생략 가능
            if (results.size() >= 10) {
                log.info("Found {} Korean stocks from cache, skipping Flask API", results.size());
                return results.stream().limit(10).collect(Collectors.toList());
            }
        }
        
        // 2. Flask API에서 한국 주식 검색 (추가 결과)
        try {
            String url = flaskApiUrl + "/api/stocks/search?q=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
            log.debug("Searching Korean stocks via Flask API: {}", url);
            
            // 타임아웃 설정 (5초)
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = 
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);
            factory.setReadTimeout(5000);
            RestTemplate timeoutRestTemplate = new RestTemplate(factory);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<List<Map<String, Object>>> response = 
                timeoutRestTemplate.getForEntity(url, (Class<List<Map<String, Object>>>) (Class<?>) List.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> flaskResults = response.getBody();
                
                if (flaskResults != null && !flaskResults.isEmpty()) {
                    // Convert Flask results to DTOs
                    List<StockSearchResponseDTO> flaskDtos = new ArrayList<>();
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
                            flaskDtos.add(dto);
                        }
                    }
                    
                    // 한국 주식만 필터링
                    flaskDtos = flaskDtos.stream()
                        .filter(dto -> dto.getMarket() != null && 
                            (dto.getMarket().equals("KRX") || 
                             dto.getMarket().equals("KR") ||
                             dto.getSymbol().matches("\\d{6}(\\.KS|\\.KQ)")))
                        .collect(Collectors.toList());
                    
                    // 중복 제거 (이미 캐시에서 찾은 결과와)
                    Set<String> existingSymbols = results.stream()
                        .map(StockSearchResponseDTO::getSymbol)
                        .collect(Collectors.toSet());
                    
                    for (StockSearchResponseDTO dto : flaskDtos) {
                        if (!existingSymbols.contains(dto.getSymbol())) {
                            results.add(dto);
                        }
                    }
                    
                    log.info("Found {} Korean stocks from Flask API (total: {})", flaskDtos.size(), results.size());
                }
            } else {
                log.warn("Flask API returned non-2xx status: {}", response.getStatusCode());
            }
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.warn("Flask API connection failed: {}. Using cache results only.", e.getMessage());
        } catch (Exception e) {
            log.warn("Flask API search failed: {}. Using cache results only.", e.getMessage());
            log.debug("Exception details: ", e);
        }
        
        // 3. yfinance 폴백: 6자리 코드 자동 변환 (캐시와 Flask API에서 찾지 못한 경우)
        if (results.isEmpty() && query.matches("\\d{6}")) {
            log.debug("Trying yfinance fallback for 6-digit code: {}", query);
            List<String> tickers = yFinanceFallbackService.convertKoreanCode(query);
            for (String ticker : tickers) {
                try {
                    // Flask API로 yfinance 조회 시도
                    String url = flaskApiUrl + "/api/stocks/search?q=" + URLEncoder.encode(ticker, StandardCharsets.UTF_8);
                    @SuppressWarnings("unchecked")
                    ResponseEntity<List<Map<String, Object>>> response = 
                        restTemplate.getForEntity(url, (Class<List<Map<String, Object>>>) (Class<?>) List.class);
                    
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        List<Map<String, Object>> flaskResults = response.getBody();
                        if (flaskResults != null && !flaskResults.isEmpty()) {
                            // 첫 번째 결과만 사용
                            Map<String, Object> stock = flaskResults.get(0);
                            StockSearchResponseDTO dto = convertFlaskResultToDTO(stock);
                            if (dto != null) {
                                results.add(dto);
                                yFinanceFallbackService.logSuccess(ticker, dto.getName());
                                break; // 성공하면 다른 티커 시도 불필요
                            }
                        }
                    }
                } catch (Exception e) {
                    yFinanceFallbackService.logFailure(ticker, e.getMessage());
                }
            }
        }
        
        log.info("Total Korean stocks found: {}", results.size());
        return results.stream().limit(10).collect(Collectors.toList());
    }
    
    /**
     * 미국 주식 검색 (로컬 + Alpha Vantage API 병렬)
     */
    private List<StockSearchResponseDTO> searchUsStocks(String query) {
        List<StockSearchResponseDTO> results = new ArrayList<>();
        
        // 1. 로컬 데이터베이스 검색 (인기 주식 목록)
        String queryUpper = query.toUpperCase();
        List<Map<String, String>> localMatches = POPULAR_STOCKS.stream()
            .filter(stock -> {
                String ticker = stock.get("ticker").toUpperCase();
                String name = stock.get("name").toUpperCase();
                String market = stock.getOrDefault("market", "").toUpperCase();
                
                // 미국 주식만 필터링
                return ("US".equals(market) || "NASDAQ".equals(market) || "NYSE".equals(market) ||
                        (!ticker.matches("\\d{6}(\\.KS|\\.KQ)") && !ticker.contains(".KS") && !ticker.contains(".KQ"))) &&
                       (ticker.contains(queryUpper) || name.contains(queryUpper));
            })
            .limit(10)
            .collect(Collectors.toList());
        
        for (Map<String, String> stock : localMatches) {
            StockSearchResponseDTO dto = convertToDTO(stock);
            results.add(dto);
        }
        
        // 2. Alpha Vantage API 병렬 검색
        CompletableFuture<List<StockSearchResponseDTO>> alphaVantageFuture = 
            CompletableFuture.supplyAsync(() -> {
                try {
                    List<AlphaVantageClient.AlphaVantageSearchResult> avResults = 
                        alphaVantageClient.searchSymbol(query);
                    
                    List<StockSearchResponseDTO> avDtos = new ArrayList<>();
                    for (AlphaVantageClient.AlphaVantageSearchResult avResult : avResults) {
                        // 미국 주식/ETF만 필터링
                        String region = avResult.getRegion();
                        if (region != null && 
                            (region.contains("United States") || region.contains("US"))) {
                            
                            StockSearchResponseDTO dto = StockSearchResponseDTO.builder()
                                .symbol(avResult.getSymbol())
                                .name(avResult.getName())
                                .market(detectExchangeFromSymbol(avResult.getSymbol()))
                                .currency("USD")
                                .currentPrice(BigDecimal.ZERO)
                                .changePercent("0.00%")
                                .changeAmount(BigDecimal.ZERO)
                                .previousClose(BigDecimal.ZERO)
                                .volume(0L)
                                .lastUpdated(LocalDateTime.now())
                                .build();
                            avDtos.add(dto);
                        }
                    }
                    
                    log.info("Alpha Vantage found {} US stocks", avDtos.size());
                    return avDtos;
                } catch (Exception e) {
                    log.warn("Alpha Vantage search failed: {}", e.getMessage());
                    return new ArrayList<>();
                }
            }, executorService);
        
        try {
            // 타임아웃 10초
            List<StockSearchResponseDTO> avResults = alphaVantageFuture.get(10, java.util.concurrent.TimeUnit.SECONDS);
            results.addAll(avResults);
        } catch (Exception e) {
            log.warn("Alpha Vantage search timeout or error: {}", e.getMessage());
            alphaVantageFuture.cancel(true);
        }
        
        // 3. yfinance 폴백 (미국 심볼)
        if (yFinanceFallbackService.isUsSymbol(query)) {
            try {
                String url = flaskApiUrl + "/api/stocks/search?q=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
                @SuppressWarnings("unchecked")
                ResponseEntity<List<Map<String, Object>>> response = 
                    restTemplate.getForEntity(url, (Class<List<Map<String, Object>>>) (Class<?>) List.class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    List<Map<String, Object>> flaskResults = response.getBody();
                    if (flaskResults != null && !flaskResults.isEmpty()) {
                        for (Map<String, Object> stock : flaskResults) {
                            StockSearchResponseDTO dto = convertFlaskResultToDTO(stock);
                            if (dto != null && !results.stream().anyMatch(r -> r.getSymbol().equals(dto.getSymbol()))) {
                                results.add(dto);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                yFinanceFallbackService.logFailure(query, e.getMessage());
            }
        }
        
        return results;
    }
    
    /**
     * Flask API 결과를 DTO로 변환
     */
    private StockSearchResponseDTO convertFlaskResultToDTO(Map<String, Object> stock) {
        try {
            String ticker = (String) stock.get("ticker");
            String name = (String) stock.get("name");
            String exchange = (String) stock.get("exchange");
            
            if (ticker == null) {
                return null;
            }
            
            return StockSearchResponseDTO.builder()
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
        } catch (Exception e) {
            log.debug("Failed to convert Flask result to DTO: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 심볼에서 거래소 추정
     */
    private String detectExchangeFromSymbol(String symbol) {
        if (symbol == null) {
            return "UNKNOWN";
        }
        
        // NASDAQ 일반적인 패턴
        if (symbol.length() <= 4 && symbol.matches("^[A-Z]{1,4}$")) {
            return "NASDAQ";
        }
        
        // NYSE 일반적인 패턴
        if (symbol.length() <= 5 && symbol.matches("^[A-Z0-9.]{1,5}$")) {
            return "NYSE";
        }
        
        return "UNKNOWN";
    }
    
    /**
     * 중복 제거 및 정렬
     */
    private List<StockSearchResponseDTO> deduplicateAndSort(List<StockSearchResponseDTO> results) {
        // 심볼 기준 중복 제거
        Map<String, StockSearchResponseDTO> uniqueResults = new LinkedHashMap<>();
        for (StockSearchResponseDTO dto : results) {
            String symbol = dto.getSymbol();
            if (symbol != null && !uniqueResults.containsKey(symbol)) {
                uniqueResults.put(symbol, dto);
            }
        }
        
        // 최대 10개만 반환
        return uniqueResults.values().stream()
            .limit(10)
            .collect(Collectors.toList());
    }
    
    /**
     * 기존 searchStocks 메서드 (하위 호환성)
     */
    public List<StockSearchResponseDTO> searchStocks(String query) {
        return searchStocks(query, "ALL");
    }
    
    /**
     * Convert Map to StockSearchResponseDTO
     */
    /**
     * Stock을 StockSearchResponseDTO로 변환
     */
    private StockSearchResponseDTO convertStockToDTO(Stock cached) {
        if (cached == null) {
            return null;
        }
        
        String symbol = cached.getSymbol();
        String name = cached.getName();
        String nameKo = cached.getNameKo();
        
        // 한국 주식의 경우 한글명 우선 표시
        if ("KR".equals(cached.getMarket()) && nameKo != null && !nameKo.isEmpty()) {
            name = nameKo;
        }
        
        return StockSearchResponseDTO.builder()
            .symbol(symbol)
            .name(name)
            .market(cached.getMarket())
            .currency("KR".equals(cached.getMarket()) ? "KRW" : "USD")
            .currentPrice(BigDecimal.ZERO)  // 캐시에는 가격 정보 없음
            .changePercent("0.00%")
            .changeAmount(BigDecimal.ZERO)
            .previousClose(BigDecimal.ZERO)
            .volume(0L)
            .lastUpdated(cached.getLastVerified() != null ? cached.getLastVerified() : LocalDateTime.now())
            .build();
    }
    
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

