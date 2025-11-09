package com.toandfrom.toandfrom.service;

import com.toandfrom.toandfrom.entity.Stock;
import com.toandfrom.toandfrom.repository.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 주식 캐시 서비스
 * 메모리 및 DB 캐시를 관리하는 서비스
 */
@Service
public class StockCacheService {
    
    private static final Logger log = LoggerFactory.getLogger(StockCacheService.class);
    
    // 메모리 캐시 (빠른 검색용)
    private final Map<String, Stock> koreanStocksCache = new ConcurrentHashMap<>();
    private final Map<String, Stock> usStocksCache = new ConcurrentHashMap<>();
    
    // 마지막 업데이트 시각
    private LocalDateTime lastUpdateKr = LocalDateTime.now().minusDays(1);
    private LocalDateTime lastUpdateUs = LocalDateTime.now().minusDays(1);
    
    // 캐시 업데이트 주기 (시간)
    private static final long CACHE_UPDATE_INTERVAL_HOURS = 24;
    
    private final StockRepository stockRepository;
    
    @Autowired
    public StockCacheService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }
    
    /**
     * 캐시에서 즉시 검색
     * 
     * @param query 검색어
     * @param market 마켓 (KR, US, ALL)
     * @return 매칭되는 주식 목록
     */
    public List<Stock> searchFromCache(String query, String market) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        String queryLower = query.toLowerCase().trim();
        List<Stock> results = new ArrayList<>();
        
        if ("KR".equals(market) || "ALL".equals(market)) {
            results.addAll(
                koreanStocksCache.values().stream()
                    .filter(s -> matches(s, queryLower))
                    .collect(Collectors.toList())
            );
        }
        
        if ("US".equals(market) || "ALL".equals(market)) {
            results.addAll(
                usStocksCache.values().stream()
                    .filter(s -> matches(s, queryLower))
                    .collect(Collectors.toList())
            );
        }
        
        // 매칭 스코어 기준 정렬 (간단한 구현)
        results.sort((a, b) -> {
            int scoreA = calculateMatchScore(a, queryLower);
            int scoreB = calculateMatchScore(b, queryLower);
            return Integer.compare(scoreB, scoreA); // 내림차순
        });
        
        // 최대 20개만 반환
        return results.stream().limit(20).collect(Collectors.toList());
    }
    
    /**
     * 주식이 검색어와 매칭되는지 확인
     */
    private boolean matches(Stock stock, String queryLower) {
        if (stock == null || !Boolean.TRUE.equals(stock.getIsActive())) {
            return false;
        }
        
        // 심볼 매칭
        if (stock.getSymbol() != null && stock.getSymbol().toLowerCase().contains(queryLower)) {
            return true;
        }
        
        // 영문명 매칭
        if (stock.getName() != null && stock.getName().toLowerCase().contains(queryLower)) {
            return true;
        }
        
        // 한글명 매칭 (한국 주식) - 원본 query 사용 (한글은 대소문자 구분 없음)
        if (stock.getNameKo() != null && stock.getNameKo().toLowerCase().contains(queryLower)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 매칭 스코어 계산 (정렬용)
     */
    private int calculateMatchScore(Stock stock, String queryLower) {
        int score = 0;
        
        // 심볼 정확 매칭: 높은 점수
        if (stock.getSymbol() != null && stock.getSymbol().toLowerCase().equals(queryLower)) {
            score += 100;
        } else if (stock.getSymbol() != null && stock.getSymbol().toLowerCase().startsWith(queryLower)) {
            score += 50;
        } else if (stock.getSymbol() != null && stock.getSymbol().toLowerCase().contains(queryLower)) {
            score += 25;
        }
        
        // 이름 시작 매칭: 중간 점수
        if (stock.getName() != null && stock.getName().toLowerCase().startsWith(queryLower)) {
            score += 30;
        } else if (stock.getName() != null && stock.getName().toLowerCase().contains(queryLower)) {
            score += 15;
        }
        
        // 한글명 매칭
        if (stock.getNameKo() != null && stock.getNameKo().toLowerCase().startsWith(queryLower)) {
            score += 30;
        } else if (stock.getNameKo() != null && stock.getNameKo().toLowerCase().contains(queryLower)) {
            score += 15;
        }
        
        return score;
    }
    
    /**
     * 캐시 업데이트 필요 여부 판단
     * 
     * @param market 마켓 (KR, US)
     * @return 업데이트 필요 여부
     */
    public boolean needsUpdate(String market) {
        LocalDateTime lastUpdate = "KR".equals(market) ? lastUpdateKr : lastUpdateUs;
        
        if (lastUpdate == null) {
            return true;
        }
        
        Duration duration = Duration.between(lastUpdate, LocalDateTime.now());
        return duration.toHours() >= CACHE_UPDATE_INTERVAL_HOURS;
    }
    
    /**
     * 캐시 초기화 (시작 시)
     */
    @PostConstruct
    @Transactional(readOnly = true)
    public void initializeCache() {
        log.info("Initializing stock cache from database...");
        loadFromDatabase();
        log.info("Stock cache initialized. KR: {} stocks, US: {} stocks", 
                 koreanStocksCache.size(), usStocksCache.size());
    }
    
    /**
     * DB에서 캐시 로드
     */
    @Transactional(readOnly = true)
    public void loadFromDatabase() {
        try {
            // 한국 주식 로드
            List<Stock> krStocks = stockRepository.findByMarketAndIsActiveTrue("KR");
            koreanStocksCache.clear();
            for (Stock stock : krStocks) {
                koreanStocksCache.put(stock.getId(), stock);
            }
            lastUpdateKr = LocalDateTime.now();
            log.info("Loaded {} Korean stocks into cache", krStocks.size());
            
            // 미국 주식 로드
            List<Stock> usStocks = stockRepository.findByMarketAndIsActiveTrue("US");
            usStocksCache.clear();
            for (Stock stock : usStocks) {
                usStocksCache.put(stock.getId(), stock);
            }
            lastUpdateUs = LocalDateTime.now();
            log.info("Loaded {} US stocks into cache", usStocks.size());
            
        } catch (Exception e) {
            log.error("Error loading stock cache from database", e);
        }
    }
    
    /**
     * 주식 캐시에 추가/업데이트
     */
    @Transactional
    public void saveToCache(Stock stock) {
        if (stock == null || stock.getId() == null) {
            return;
        }
        
        try {
            // DB에 저장
            stock.setLastVerified(LocalDateTime.now());
            stockRepository.save(stock);
            
            // 메모리 캐시에 추가
            if ("KR".equals(stock.getMarket())) {
                koreanStocksCache.put(stock.getId(), stock);
            } else if ("US".equals(stock.getMarket())) {
                usStocksCache.put(stock.getId(), stock);
            }
            
        } catch (Exception e) {
            log.error("Error saving stock to cache: {}", stock.getId(), e);
        }
    }
    
    /**
     * 여러 주식 일괄 저장
     */
    @Transactional
    public void saveAllToCache(List<Stock> stocks) {
        if (stocks == null || stocks.isEmpty()) {
            return;
        }
        
        try {
            LocalDateTime now = LocalDateTime.now();
            for (Stock stock : stocks) {
                if (stock.getId() == null) {
                    continue;
                }
                stock.setLastVerified(now);
            }
            
            // DB에 일괄 저장
            stockRepository.saveAll(stocks);
            
            // 메모리 캐시에 추가
            for (Stock stock : stocks) {
                if ("KR".equals(stock.getMarket())) {
                    koreanStocksCache.put(stock.getId(), stock);
                } else if ("US".equals(stock.getMarket())) {
                    usStocksCache.put(stock.getId(), stock);
                }
            }
            
            log.info("Saved {} stocks to cache", stocks.size());
            
        } catch (Exception e) {
            log.error("Error saving stocks to cache", e);
        }
    }
    
    /**
     * 캐시에서 주식 조회
     */
    public Optional<Stock> findById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        
        // 메모리 캐시에서 먼저 조회
        Stock stock = koreanStocksCache.get(id);
        if (stock == null) {
            stock = usStocksCache.get(id);
        }
        
        if (stock != null) {
            return Optional.of(stock);
        }
        
        // DB에서 조회
        return stockRepository.findById(id);
    }
    
    /**
     * 심볼과 마켓으로 조회
     */
    public Optional<Stock> findBySymbolAndMarket(String symbol, String market) {
        // 메모리 캐시에서 조회
        Map<String, Stock> cache = "KR".equals(market) ? koreanStocksCache : usStocksCache;
        Optional<Stock> cached = cache.values().stream()
            .filter(s -> symbol.equals(s.getSymbol()))
            .findFirst();
        
        if (cached.isPresent()) {
            return cached;
        }
        
        // DB에서 조회
        return stockRepository.findBySymbolAndMarket(symbol, market);
    }
    
    /**
     * 캐시 통계 조회
     */
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("koreanStocks", koreanStocksCache.size());
        stats.put("usStocks", usStocksCache.size());
        stats.put("lastUpdateKr", lastUpdateKr);
        stats.put("lastUpdateUs", lastUpdateUs);
        stats.put("needsUpdateKr", needsUpdate("KR"));
        stats.put("needsUpdateUs", needsUpdate("US"));
        return stats;
    }
    
    /**
     * 캐시 강제 새로고침
     */
    @Transactional
    public void refreshCache(String market) {
        log.info("Refreshing cache for market: {}", market);
        loadFromDatabase();
    }
    
    /**
     * 캐시 업데이트 (API 결과를 캐시에 저장)
     * 
     * @param stocks 저장할 주식 목록
     * @param market 마켓 (KR, US)
     */
    @Transactional
    public void updateCache(List<Stock> stocks, String market) {
        if (stocks == null || stocks.isEmpty()) {
            return;
        }
        
        try {
            // DB에 저장
            saveAllToCache(stocks);
            
            // 마지막 업데이트 시각 갱신
            if ("KR".equals(market)) {
                lastUpdateKr = LocalDateTime.now();
            } else if ("US".equals(market)) {
                lastUpdateUs = LocalDateTime.now();
            }
            
            log.info("Updated cache for market {}: {} stocks", market, stocks.size());
            
        } catch (Exception e) {
            log.error("Error updating cache for market {}: {}", market, e.getMessage(), e);
        }
    }
    
    /**
     * 신규 주식 추가
     * 
     * @param stocks 추가할 주식 목록
     * @param market 마켓 (KR, US)
     */
    @Transactional
    public void addStocks(List<Stock> stocks, String market) {
        if (stocks == null || stocks.isEmpty()) {
            return;
        }
        
        try {
            // 기존 주식과 중복 체크
            Set<String> existingSymbols = getAllSymbols(market);
            List<Stock> newStocks = stocks.stream()
                .filter(s -> s.getSymbol() != null && !existingSymbols.contains(s.getSymbol()))
                .collect(Collectors.toList());
            
            if (newStocks.isEmpty()) {
                log.info("No new stocks to add for market {}", market);
                return;
            }
            
            // DB에 저장
            saveAllToCache(newStocks);
            
            // 마지막 업데이트 시각 갱신
            if ("KR".equals(market)) {
                lastUpdateKr = LocalDateTime.now();
            } else if ("US".equals(market)) {
                lastUpdateUs = LocalDateTime.now();
            }
            
            log.info("Added {} new stocks to market {}", newStocks.size(), market);
            
        } catch (Exception e) {
            log.error("Error adding stocks to market {}: {}", market, e.getMessage(), e);
        }
    }
    
    /**
     * 상장폐지 주식 표시
     * 
     * @param stocks 상장폐지된 주식 목록
     */
    @Transactional
    public void markAsInactive(List<Stock> stocks) {
        if (stocks == null || stocks.isEmpty()) {
            return;
        }
        
        try {
            LocalDateTime now = LocalDateTime.now();
            int count = 0;
            
            for (Stock stock : stocks) {
                if (stock.getId() == null) {
                    continue;
                }
                
                Optional<Stock> existing = findById(stock.getId());
                if (existing.isPresent()) {
                    Stock cached = existing.get();
                    cached.setIsActive(false);
                    cached.setDelistedDate(now);  // 상장폐지일 설정
                    cached.setLastVerified(now);
                    stockRepository.save(cached);
                    
                    // 메모리 캐시에서도 제거
                    koreanStocksCache.remove(cached.getId());
                    usStocksCache.remove(cached.getId());
                    
                    count++;
                }
            }
            
            log.info("Marked {} stocks as inactive (delisted)", count);
            
        } catch (Exception e) {
            log.error("Error marking stocks as inactive: {}", e.getMessage(), e);
        }
    }
    
    /**
     * 모든 심볼 조회 (마켓별)
     * 
     * @param market 마켓 (KR, US, null이면 전체)
     * @return 심볼 Set
     */
    public Set<String> getAllSymbols(String market) {
        Set<String> symbols = new HashSet<>();
        
        if (market == null || "KR".equals(market) || "ALL".equals(market)) {
            symbols.addAll(
                koreanStocksCache.values().stream()
                    .map(Stock::getSymbol)
                    .filter(s -> s != null)
                    .collect(Collectors.toSet())
            );
        }
        
        if (market == null || "US".equals(market) || "ALL".equals(market)) {
            symbols.addAll(
                usStocksCache.values().stream()
                    .map(Stock::getSymbol)
                    .filter(s -> s != null)
                    .collect(Collectors.toSet())
            );
        }
        
        // DB에서도 조회 (메모리 캐시에 없는 경우)
        if (market == null || "KR".equals(market) || "ALL".equals(market)) {
            List<Stock> dbStocks = stockRepository.findByMarket("KR");
            dbStocks.forEach(s -> {
                if (s.getSymbol() != null) {
                    symbols.add(s.getSymbol());
                }
            });
        }
        
        if (market == null || "US".equals(market) || "ALL".equals(market)) {
            List<Stock> dbStocks = stockRepository.findByMarket("US");
            dbStocks.forEach(s -> {
                if (s.getSymbol() != null) {
                    symbols.add(s.getSymbol());
                }
            });
        }
        
        return symbols;
    }
    
    /**
     * 활성 주식 목록 조회
     * 
     * @return 활성 주식 목록
     */
    @Transactional(readOnly = true)
    public List<Stock> getActiveStocks() {
        List<Stock> activeStocks = new ArrayList<>();
        
        // 메모리 캐시에서 활성 주식만 필터링
        koreanStocksCache.values().stream()
            .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
            .forEach(activeStocks::add);
        
        usStocksCache.values().stream()
            .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
            .forEach(activeStocks::add);
        
        // DB에서도 조회 (메모리 캐시에 없는 경우)
        List<Stock> dbKrStocks = stockRepository.findByMarketAndIsActiveTrue("KR");
        for (Stock stock : dbKrStocks) {
            if (!koreanStocksCache.containsKey(stock.getId())) {
                activeStocks.add(stock);
            }
        }
        
        List<Stock> dbUsStocks = stockRepository.findByMarketAndIsActiveTrue("US");
        for (Stock stock : dbUsStocks) {
            if (!usStocksCache.containsKey(stock.getId())) {
                activeStocks.add(stock);
            }
        }
        
        return activeStocks;
    }
}

