package com.toandfrom.toandfrom.service;

import com.toandfrom.toandfrom.client.AlphaVantageClient;
import com.toandfrom.toandfrom.client.YFinanceClient;
import com.toandfrom.toandfrom.dto.SearchResult;
import com.toandfrom.toandfrom.entity.Stock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

/**
 * 실시간 주식 검색 서비스
 * 하이브리드 검색: 캐시 우선, API 폴백
 */
@Service
public class RealTimeStockService {
    
    private static final Logger log = LoggerFactory.getLogger(RealTimeStockService.class);
    
    private final StockCacheService cacheService;
    private final AlphaVantageClient alphaVantageClient;
    private final YFinanceClient yfinanceClient;
    
    public RealTimeStockService(
            StockCacheService cacheService,
            AlphaVantageClient alphaVantageClient,
            YFinanceClient yfinanceClient) {
        this.cacheService = cacheService;
        this.alphaVantageClient = alphaVantageClient;
        this.yfinanceClient = yfinanceClient;
    }
    
    /**
     * 하이브리드 검색: 캐시 우선, API 폴백
     * 
     * @param query 검색어
     * @param market 마켓 필터 (KR, US, ALL)
     * @return 검색 결과
     */
    public SearchResult searchStocks(String query, String market) {
        if (query == null || query.trim().isEmpty()) {
            return new SearchResult(new ArrayList<>(), "EMPTY", query, market);
        }
        
        // market 정규화
        if (market == null) {
            market = "ALL";
        }
        market = market.toUpperCase();
        
        log.info("Real-time stock search: query='{}', market='{}'", query, market);
        
        // 1. 캐시에서 먼저 검색
        List<Stock> cachedResults = cacheService.searchFromCache(query, market);
        
        // 2. 캐시 결과 반환 (또는 업데이트 필요 시에만 API 호출)
        if (!cachedResults.isEmpty() && !cacheService.needsUpdate(market)) {
            log.info("Returning {} results from cache", cachedResults.size());
            return new SearchResult(cachedResults, "CACHE", query, market);
        }
        
        // 3. 캐시 미스 또는 업데이트 필요 → API 호출
        List<Stock> apiResults = new ArrayList<>();
        if (cachedResults.isEmpty() || cacheService.needsUpdate(market)) {
            log.info("Cache miss or needs update, fetching from APIs...");
            apiResults = fetchFromApis(query, market);
            
            // 4. API 결과를 DB에 저장 (다음 검색 캐시용)
            if (!apiResults.isEmpty()) {
                // 마켓별로 분리하여 저장
                Map<String, List<Stock>> byMarket = apiResults.stream()
                    .collect(Collectors.groupingBy(Stock::getMarket));
                
                for (Map.Entry<String, List<Stock>> entry : byMarket.entrySet()) {
                    cacheService.updateCache(entry.getValue(), entry.getKey());
                }
            }
        }
        
        // 5. 캐시 + API 결과 병합 (중복 제거)
        List<Stock> merged = mergeCacheAndApi(cachedResults, apiResults);
        
        String source = !cachedResults.isEmpty() && !apiResults.isEmpty() 
            ? "HYBRID" 
            : (!apiResults.isEmpty() ? "API" : "CACHE");
        
        log.info("Returning {} results from {}", merged.size(), source);
        return new SearchResult(merged, source, query, market);
    }
    
    /**
     * 병렬로 여러 API 호출
     * 
     * @param query 검색어
     * @param market 마켓 필터
     * @return API 검색 결과
     */
    private List<Stock> fetchFromApis(String query, String market) {
        List<Stock> results = new ArrayList<>();
        
        // Alpha Vantage는 미국 주식만 검색
        CompletableFuture<List<Stock>> alphaFuture = null;
        if ("US".equals(market) || "ALL".equals(market)) {
            alphaFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    List<AlphaVantageClient.AlphaVantageSearchResult> avResults = 
                        alphaVantageClient.searchSymbol(query);
                    
                    return convertAlphaVantageResults(avResults);
                } catch (Exception e) {
                    log.warn("Alpha Vantage search failed: {}", e.getMessage());
                    return new ArrayList<>();
                }
            });
        }
        
        // YFinance는 모든 마켓 검색 가능
        CompletableFuture<List<Stock>> yfinanceFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return yfinanceClient.search(query, market);
            } catch (Exception e) {
                log.warn("YFinance search failed: {}", e.getMessage());
                return new ArrayList<>();
            }
        });
        
        try {
            // 타임아웃: 5초
            if (alphaFuture != null) {
                List<Stock> alphaResults = alphaFuture.get(5, TimeUnit.SECONDS);
                results.addAll(alphaResults);
            }
            
            List<Stock> yfinanceResults = yfinanceFuture.get(5, TimeUnit.SECONDS);
            results.addAll(yfinanceResults);
            
        } catch (TimeoutException e) {
            log.warn("API timeout after 5 seconds, returning partial results");
            // 부분 결과라도 반환
            if (alphaFuture != null && alphaFuture.isDone()) {
                try {
                    results.addAll(alphaFuture.get());
                } catch (Exception ex) {
                    log.debug("Failed to get Alpha Vantage results: {}", ex.getMessage());
                }
            }
            if (yfinanceFuture.isDone()) {
                try {
                    results.addAll(yfinanceFuture.get());
                } catch (Exception ex) {
                    log.debug("Failed to get YFinance results: {}", ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error fetching from APIs: {}", e.getMessage(), e);
        }
        
        // 중복 제거 (ID 기준)
        Map<String, Stock> uniqueResults = new LinkedHashMap<>();
        for (Stock stock : results) {
            if (stock != null && stock.getId() != null) {
                uniqueResults.putIfAbsent(stock.getId(), stock);
            }
        }
        
        return new ArrayList<>(uniqueResults.values());
    }
    
    /**
     * Alpha Vantage 결과를 Stock으로 변환
     */
    private List<Stock> convertAlphaVantageResults(
            List<AlphaVantageClient.AlphaVantageSearchResult> avResults) {
        
        List<Stock> stocks = new ArrayList<>();
        
        for (AlphaVantageClient.AlphaVantageSearchResult avResult : avResults) {
            // 미국 주식/ETF만 필터링
            String region = avResult.getRegion();
            if (region == null || 
                (!region.contains("United States") && !region.contains("US"))) {
                continue;
            }
            
            String symbol = avResult.getSymbol();
            String id = "us_" + symbol.toLowerCase();
            
            Stock stock = new Stock();
            stock.setId(id);
            stock.setSymbol(symbol);
            stock.setName(avResult.getName());
            stock.setMarket("US");
            stock.setType(avResult.getType() != null ? avResult.getType().toUpperCase() : "STOCK");
            stock.setExchange(avResult.getRegion());
            stock.setIsActive(true);
            stock.setLastVerified(LocalDateTime.now());
            stock.setSource("ALPHA_VANTAGE");
            
            stocks.add(stock);
        }
        
        return stocks;
    }
    
    /**
     * 캐시와 API 결과 병합 (중복 제거)
     * 
     * @param cachedResults 캐시 결과
     * @param apiResults API 결과
     * @return 병합된 결과
     */
    private List<Stock> mergeCacheAndApi(
            List<Stock> cachedResults, 
            List<Stock> apiResults) {
        
        // ID 기준으로 중복 제거 (캐시 우선)
        Map<String, Stock> merged = new LinkedHashMap<>();
        
        // 1. 캐시 결과 먼저 추가
        for (Stock cached : cachedResults) {
            if (cached != null && cached.getId() != null) {
                merged.put(cached.getId(), cached);
            }
        }
        
        // 2. API 결과 추가 (캐시에 없는 것만)
        for (Stock api : apiResults) {
            if (api != null && api.getId() != null && !merged.containsKey(api.getId())) {
                merged.put(api.getId(), api);
            }
        }
        
        return new ArrayList<>(merged.values());
    }
}

