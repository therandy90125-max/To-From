package com.toandfrom.toandfrom.service;

import com.toandfrom.toandfrom.client.KRXClient;
import com.toandfrom.toandfrom.client.SECClient;
import com.toandfrom.toandfrom.entity.Stock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 주식 동기화 스케줄러
 * 매일/매주 자동으로 상장 종목 목록을 업데이트
 */
@Component
public class StockSyncScheduler {
    
    private static final Logger log = LoggerFactory.getLogger(StockSyncScheduler.class);
    
    private final StockCacheService cacheService;
    private final KRXClient krxClient;
    private final SECClient secClient;
    
    public StockSyncScheduler(
            StockCacheService cacheService,
            KRXClient krxClient,
            SECClient secClient) {
        this.cacheService = cacheService;
        this.krxClient = krxClient;
        this.secClient = secClient;
    }
    
    /**
     * 매일 자정에 한국 주식 동기화
     * Cron: 0 0 0 * * * (매일 00:00)
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void syncKoreanStocks() {
        log.info("🔄 한국 주식 동기화 시작...");
        
        try {
            // KRX에서 최신 상장 종목 조회
            List<Stock> latestStocks = krxClient.getListedStocks();
            
            if (latestStocks.isEmpty()) {
                log.warn("⚠️ KRX API에서 종목 목록을 가져오지 못했습니다.");
                return;
            }
            
            log.info("📊 최신 상장 종목 수: {}개", latestStocks.size());
            
            // DB의 기존 데이터와 비교
            List<Stock> newListings = findNewListings(latestStocks, "KR");
            List<Stock> delistings = findDelistings(latestStocks, "KR");
            
            // 신규 상장 추가
            if (!newListings.isEmpty()) {
                log.info("✅ 신규 상장: {} 종목", newListings.size());
                cacheService.addStocks(newListings, "KR");
            } else {
                log.info("ℹ️ 신규 상장 종목 없음");
            }
            
            // 상장폐지 표시
            if (!delistings.isEmpty()) {
                log.warn("❌ 상장폐지: {} 종목", delistings.size());
                cacheService.markAsInactive(delistings);
            } else {
                log.info("ℹ️ 상장폐지 종목 없음");
            }
            
            log.info("✅ 한국 주식 동기화 완료");
            
        } catch (Exception e) {
            log.error("❌ 한국 주식 동기화 실패", e);
        }
    }
    
    /**
     * 매주 월요일에 미국 주식/ETF 동기화
     * Cron: 0 0 9 ? * MON (매주 월요일 09:00)
     */
    @Scheduled(cron = "0 0 9 ? * MON")
    public void syncUsStocks() {
        log.info("🔄 미국 주식/ETF 동기화 시작...");
        
        try {
            // SEC Edgar에서 상장 회사 목록 조회
            List<Stock> latestStocks = secClient.getListedStocks();
            
            if (latestStocks.isEmpty()) {
                log.warn("⚠️ SEC API에서 종목 목록을 가져오지 못했습니다.");
                return;
            }
            
            log.info("📊 최신 상장 종목 수: {}개", latestStocks.size());
            
            // 신규 상장 / 상장폐지 처리
            List<Stock> newListings = findNewListings(latestStocks, "US");
            List<Stock> delistings = findDelistings(latestStocks, "US");
            
            if (!newListings.isEmpty()) {
                log.info("✅ 신규 상장(미국): {} 종목", newListings.size());
                cacheService.addStocks(newListings, "US");
            } else {
                log.info("ℹ️ 신규 상장 종목(미국) 없음");
            }
            
            if (!delistings.isEmpty()) {
                log.warn("❌ 상장폐지(미국): {} 종목", delistings.size());
                cacheService.markAsInactive(delistings);
            } else {
                log.info("ℹ️ 상장폐지 종목(미국) 없음");
            }
            
            log.info("✅ 미국 주식/ETF 동기화 완료");
            
        } catch (Exception e) {
            log.error("❌ 미국 주식/ETF 동기화 실패", e);
        }
    }
    
    /**
     * 신규 상장 종목 찾기
     * 
     * @param latestStocks 최신 상장 종목 목록
     * @param market 마켓 (KR, US)
     * @return 신규 상장 종목 목록
     */
    private List<Stock> findNewListings(List<Stock> latestStocks, String market) {
        // DB와 비교해서 신규 종목만 필터링
        Set<String> existingSymbols = cacheService.getAllSymbols(market);
        
        return latestStocks.stream()
            .filter(s -> s.getSymbol() != null && !existingSymbols.contains(s.getSymbol()))
            .collect(Collectors.toList());
    }
    
    /**
     * 상장폐지 종목 찾기
     * 
     * @param latestStocks 최신 상장 종목 목록
     * @param market 마켓 (KR, US)
     * @return 상장폐지 종목 목록
     */
    private List<Stock> findDelistings(List<Stock> latestStocks, String market) {
        // 최신 리스트의 심볼 Set
        Set<String> currentSymbols = latestStocks.stream()
            .map(Stock::getSymbol)
            .filter(s -> s != null)
            .collect(Collectors.toSet());
        
        // DB의 활성 주식 중 최신 리스트에 없는 것
        return cacheService.getActiveStocks().stream()
            .filter(s -> market.equals(s.getMarket()))
            .filter(s -> s.getSymbol() != null && !currentSymbols.contains(s.getSymbol()))
            .collect(Collectors.toList());
    }
}

