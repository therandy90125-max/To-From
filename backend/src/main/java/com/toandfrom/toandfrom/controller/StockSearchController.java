package com.toandfrom.toandfrom.controller;

import com.toandfrom.toandfrom.service.StockSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173")
public class StockSearchController {
    
    private final StockSearchService stockSearchService;
    
    public StockSearchController(StockSearchService stockSearchService) {
        this.stockSearchService = stockSearchService;
    }
    
    /**
     * 주식 검색 API
     * 티커 또는 회사명으로 검색
     * 
     * @param query 검색어 (티커 또는 회사명)
     * @return 검색 결과 목록
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStocks(@RequestParam String q) {
        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "검색어가 필요합니다."
                ));
            }
            
            List<Map<String, String>> results = stockSearchService.searchStocks(q.trim());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "results", results
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "주식 검색 중 오류: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 주식 정보 조회 API
     * 특정 티커의 상세 정보 조회
     * 
     * @param ticker 주식 티커 심볼
     * @return 주식 상세 정보
     */
    @GetMapping("/info/{ticker}")
    public ResponseEntity<Map<String, Object>> getStockInfo(@PathVariable String ticker) {
        try {
            if (ticker == null || ticker.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "티커가 필요합니다."
                ));
            }
            
            Map<String, Object> info = stockSearchService.getStockInfo(ticker.trim());
            
            if (info == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", info
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "주식 정보 조회 중 오류: " + e.getMessage()
            ));
        }
    }
}

