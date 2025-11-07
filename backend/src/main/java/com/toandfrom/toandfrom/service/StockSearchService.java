package com.toandfrom.toandfrom.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StockSearchService {
    
    private final RestTemplate restTemplate;
    
    // 인기 주식 목록 (캐시용)
    private static final List<Map<String, String>> POPULAR_STOCKS = Arrays.asList(
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
    
    public StockSearchService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    private static Map<String, String> createStock(String ticker, String name, String exchange) {
        Map<String, String> stock = new HashMap<>();
        stock.put("ticker", ticker);
        stock.put("name", name);
        stock.put("exchange", exchange);
        stock.put("displayName", ticker + " - " + name);
        return stock;
    }
    
    /**
     * 주식 검색
     * 티커 또는 회사명으로 검색
     * 
     * @param query 검색어
     * @return 검색 결과 목록 (최대 5개)
     */
    public List<Map<String, String>> searchStocks(String query) {
        String queryUpper = query.toUpperCase();
        
        // 인기 주식 목록에서 검색
        List<Map<String, String>> results = POPULAR_STOCKS.stream()
            .filter(stock -> 
                stock.get("ticker").toUpperCase().contains(queryUpper) ||
                stock.get("name").toUpperCase().contains(queryUpper)
            )
            .limit(5)
            .collect(Collectors.toList());
        
        // TODO: 실제 API 연동 (yfinance Python 백엔드 또는 Alpha Vantage)
        // 현재는 로컬 데이터만 사용
        
        return results;
    }
    
    /**
     * 주식 정보 조회
     * 
     * @param ticker 주식 티커
     * @return 주식 상세 정보
     */
    public Map<String, Object> getStockInfo(String ticker) {
        // 인기 주식 목록에서 찾기
        Optional<Map<String, String>> stock = POPULAR_STOCKS.stream()
            .filter(s -> s.get("ticker").equalsIgnoreCase(ticker))
            .findFirst();
        
        if (stock.isPresent()) {
            Map<String, Object> info = new HashMap<>(stock.get());
            // 추가 정보 (나중에 실제 API에서 가져올 데이터)
            info.put("currentPrice", 0.0);
            info.put("currency", "USD");
            return info;
        }
        
        // TODO: 실제 API 연동하여 실시간 정보 가져오기
        
        return null;
    }
}

