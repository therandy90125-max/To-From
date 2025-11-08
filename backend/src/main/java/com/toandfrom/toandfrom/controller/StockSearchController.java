package com.toandfrom.toandfrom.controller;

import com.toandfrom.toandfrom.dto.StockSearchResponseDTO;
import com.toandfrom.toandfrom.service.StockSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
// CORS는 WebConfig에서 전역 설정됨
public class StockSearchController {

    private final StockSearchService stockSearchService;

    /**
     * 주식 검색 (US + Korean markets)
     * Query param: 'query' 또는 'q' 둘다 허용
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchStocks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String q
    ) {
        // 'query' 또는 'q' 둘 중 하나 사용
        String searchQuery = query != null ? query : q;
        
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "error", "검색어를 입력하세요 (query parameter required)"
                ));
        }
        
        log.info("Stock search request: {}", searchQuery);
        
        try {
            List<StockSearchResponseDTO> results = stockSearchService.searchStocks(searchQuery);
            
            log.info("Search results: {} stocks found", results.size());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", results != null ? results : List.of(),
                "count", results != null ? results.size() : 0
            ));
            
        } catch (Exception e) {
            log.error("Stock search failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of(
                    "success", false,
                    "error", "주식 검색 실패: " + e.getMessage()
                ));
        }
    }

    /**
     * 단일 주식 정보 조회
     */
    @GetMapping("/{symbol}")
    public ResponseEntity<?> getStockInfo(@PathVariable String symbol) {
        log.info("Get stock info: {}", symbol);
        
        try {
            StockSearchResponseDTO stock = stockSearchService.getStockInfo(symbol);
            
            if (stock == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stock
            ));
            
        } catch (Exception e) {
            log.error("Failed to get stock info: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of(
                    "success", false,
                    "error", e.getMessage()
                ));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "service", "stock-api",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
