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
     * 
     * Query params:
     *   - query 또는 q: 검색어 (필수)
     *   - market: 시장 필터 (KR/US/ALL, 선택사항, 기본값: ALL)
     * 
     * 요청 예시:
     *   - GET /api/stocks/search?query=삼성전자&market=KR
     *   - GET /api/stocks/search?query=AAPL&market=US
     *   - GET /api/stocks/search?query=apple&market=ALL
     * 
     * UTF-8 디코딩: Spring Boot는 기본적으로 UTF-8로 디코딩 (application.properties 설정)
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchStocks(
            @RequestParam(required = false, value = "query") String query,
            @RequestParam(required = false, value = "q") String q,
            @RequestParam(required = false, value = "market") String market
    ) {
        // 'query' 또는 'q' 둘 중 하나 사용
        String searchQuery = query != null ? query : q;
        
        // 검색어 유효성 검사
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "error", "검색어를 입력하세요 (query parameter required)",
                    "code", "BAD_REQUEST"
                ));
        }
        
        // market 파라미터 유효성 검사
        if (market != null) {
            market = market.toUpperCase();
            if (!market.equals("KR") && !market.equals("US") && !market.equals("ALL")) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "success", false,
                        "error", "잘못된 market 파라미터입니다. (KR/US/ALL만 허용)",
                        "code", "BAD_REQUEST"
                    ));
            }
        }
        
        // UTF-8 디코딩 확인 (Spring Boot는 자동으로 처리하지만 로그로 확인)
        log.info("Stock search request (UTF-8): query='{}', market='{}'", searchQuery, market);
        log.debug("Query encoding check - bytes length: {}", 
            searchQuery.getBytes(java.nio.charset.StandardCharsets.UTF_8).length);
        
        try {
            List<StockSearchResponseDTO> results = stockSearchService.searchStocks(searchQuery, market);
            
            log.info("Search results: {} stocks found", results.size());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", results != null ? results : List.of(),
                "count", results != null ? results.size() : 0,
                "query", searchQuery,
                "market", market != null ? market : "ALL"
            ));
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            // API 연결 실패 (503 Service Unavailable)
            log.error("Stock search API connection failed: {}", e.getMessage());
            return ResponseEntity.status(503)
                .body(Map.of(
                    "success", false,
                    "error", "주식 검색 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
                    "code", "SERVICE_UNAVAILABLE"
                ));
        } catch (Exception e) {
            log.error("Stock search failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of(
                    "success", false,
                    "error", "주식 검색 실패: " + e.getMessage(),
                    "code", "INTERNAL_SERVER_ERROR"
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
