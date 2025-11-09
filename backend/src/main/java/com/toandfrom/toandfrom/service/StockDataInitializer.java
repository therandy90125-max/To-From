package com.toandfrom.toandfrom.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.toandfrom.toandfrom.entity.Stock;
import com.toandfrom.toandfrom.repository.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 주식 데이터 초기화 서비스
 * 애플리케이션 시작 시 JSON 파일에서 주식 데이터를 로드하여 DB에 저장
 */
@Service
public class StockDataInitializer {
    
    private static final Logger log = LoggerFactory.getLogger(StockDataInitializer.class);
    
    private final StockRepository stockRepository;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public StockDataInitializer(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * 애플리케이션 시작 시 자동 실행
     */
    @PostConstruct
    @Transactional
    public void initializeStockData() {
        log.info("Starting stock data initialization...");
        
        // 한국 주식 데이터 로드
        loadKoreanStocks();
        
        // 미국 주식 데이터 로드 (SEC API)
        loadUsStocks();
        
        log.info("Stock data initialization completed");
    }
    
    /**
     * 한국 주식 데이터 로드 (korean_stocks.json)
     */
    private void loadKoreanStocks() {
        try {
            ClassPathResource resource = new ClassPathResource("data/korean_stocks.json");
            
            if (!resource.exists()) {
                log.warn("Korean stocks JSON file not found: data/korean_stocks.json");
                return;
            }
            
            log.info("Loading Korean stocks from JSON file...");
            
            InputStream inputStream = resource.getInputStream();
            List<Map<String, Object>> stocksData = objectMapper.readValue(
                inputStream, 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            log.info("Found {} Korean stocks in JSON file", stocksData.size());
            
            List<Stock> stocks = new ArrayList<>();
            int newCount = 0;
            int updateCount = 0;
            
            for (Map<String, Object> stockData : stocksData) {
                try {
                    String ticker = (String) stockData.get("ticker");
                    String nameEn = (String) stockData.get("name_en");
                    String nameKo = (String) stockData.get("name_ko");
                    String market = (String) stockData.get("market");
                    String sector = (String) stockData.get("sector");
                    
                    if (ticker == null || ticker.trim().isEmpty()) {
                        continue;
                    }
                    
                    // ID 생성: kr_005930 형식
                    String id = "kr_" + ticker;
                    
                    // 심볼 생성: 005930.KS 또는 005930.KQ 형식
                    String symbol = ticker;
                    if (market != null) {
                        if (market.equals("KOSPI")) {
                            symbol = ticker + ".KS";
                        } else if (market.equals("KOSDAQ")) {
                            symbol = ticker + ".KQ";
                        }
                    }
                    
                    // 기존 주식 확인
                    Optional<Stock> existing = stockRepository.findById(id);
                    
                    Stock stock;
                    if (existing.isPresent()) {
                        stock = existing.get();
                        updateCount++;
                    } else {
                        stock = new Stock();
                        stock.setId(id);
                        stock.setIsActive(true);
                        stock.setListedDate(LocalDateTime.now());
                        stock.setSource("NAVER");
                        newCount++;
                    }
                    
                    // 데이터 업데이트
                    stock.setSymbol(symbol);
                    stock.setName(nameEn != null ? nameEn : nameKo);
                    stock.setNameKo(nameKo);
                    stock.setMarket("KR");
                    stock.setType("STOCK");
                    stock.setSector(sector);
                    stock.setExchange(market); // KOSPI 또는 KOSDAQ
                    stock.setLastVerified(LocalDateTime.now());
                    
                    stocks.add(stock);
                    
                } catch (Exception e) {
                    log.warn("Failed to process stock data: {}", stockData, e);
                }
            }
            
            // 일괄 저장
            if (!stocks.isEmpty()) {
                stockRepository.saveAll(stocks);
                log.info("✅ Korean stocks loaded: {} new, {} updated, {} total", 
                        newCount, updateCount, stocks.size());
            } else {
                log.warn("No Korean stocks to save");
            }
            
        } catch (Exception e) {
            log.error("Failed to load Korean stocks from JSON", e);
        }
    }
    
    /**
     * 미국 주식 데이터 로드
     * SEC API를 통해 전체 상장사 목록을 가져와서 저장
     */
    private void loadUsStocks() {
        try {
            log.info("Loading US stocks from SEC API...");
            
            // SEC API 호출
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "ToAndFrom Portfolio Optimizer (contact@example.com)");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            String url = "https://www.sec.gov/files/company_tickers.json";
            @SuppressWarnings("unchecked")
            org.springframework.http.ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                org.springframework.http.HttpMethod.GET,
                entity,
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = response.getBody();
                
                if (data == null) {
                    log.warn("SEC API returned null data");
                    return;
                }
                
                List<Stock> stocks = new ArrayList<>();
                int newCount = 0;
                int updateCount = 0;
                
                for (Object entry : data.values()) {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> company = (Map<String, Object>) entry;
                        
                        String ticker = (String) company.get("ticker");
                        String name = (String) company.get("title");
                        
                        if (ticker == null || ticker.trim().isEmpty() || 
                            name == null || name.trim().isEmpty()) {
                            continue;
                        }
                        
                        // ID 생성: us_AAPL 형식
                        String id = "us_" + ticker.toUpperCase();
                        
                        // 기존 주식 확인
                        Optional<Stock> existing = stockRepository.findById(id);
                        
                        Stock stock;
                        if (existing.isPresent()) {
                            stock = existing.get();
                            updateCount++;
                        } else {
                            stock = new Stock();
                            stock.setId(id);
                            stock.setIsActive(true);
                            stock.setListedDate(LocalDateTime.now());
                            stock.setSource("SEC");
                            newCount++;
                        }
                        
                        // 데이터 업데이트
                        stock.setSymbol(ticker.toUpperCase());
                        stock.setName(name);
                        stock.setMarket("US");
                        stock.setType("STOCK");
                        stock.setExchange(detectExchange(ticker));
                        stock.setLastVerified(LocalDateTime.now());
                        
                        stocks.add(stock);
                        
                    } catch (Exception e) {
                        log.warn("Failed to process US stock: {}", entry, e);
                    }
                }
                
                // 일괄 저장
                if (!stocks.isEmpty()) {
                    stockRepository.saveAll(stocks);
                    log.info("✅ US stocks loaded: {} new, {} updated, {} total", 
                            newCount, updateCount, stocks.size());
                } else {
                    log.warn("No US stocks to save");
                }
                
            } else {
                log.warn("SEC API returned non-2xx status: {}", response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Failed to load US stocks from SEC API", e);
        }
    }
    
    /**
     * 티커로 거래소 추정
     */
    private String detectExchange(String ticker) {
        if (ticker == null || ticker.length() > 5) {
            return "UNKNOWN";
        }
        
        // 일반적인 패턴으로 거래소 추정
        // 실제로는 정확한 거래소 정보가 필요하지만, 여기서는 간단히 추정
        if (ticker.length() <= 4 && ticker.matches("^[A-Z]{1,4}$")) {
            return "NASDAQ";
        }
        
        return "NYSE"; // 기본값
    }
}

