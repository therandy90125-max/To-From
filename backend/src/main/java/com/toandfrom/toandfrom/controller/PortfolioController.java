package com.toandfrom.toandfrom.controller;

import com.toandfrom.toandfrom.dto.PortfolioRequest;
import com.toandfrom.toandfrom.service.PortfolioOptimizationService;
import com.toandfrom.toandfrom.service.PortfolioDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
// CORS는 WebConfig에서 전역 설정됨
public class PortfolioController {

    private final PortfolioOptimizationService portfolioService;
    private final PortfolioDataService portfolioDataService;

    public PortfolioController(
            PortfolioOptimizationService portfolioService,
            PortfolioDataService portfolioDataService) {
        this.portfolioService = portfolioService;
        this.portfolioDataService = portfolioDataService;
    }

    /**
     * 포트폴리오 최적화 요청 (Spring Boot → Flask)
     * 
     * @param request PortfolioRequest DTO (tickers, riskFactor, method, period, autoSave)
     * @return 최적화 결과
     */
    @PostMapping("/optimize")
    public ResponseEntity<Map<String, Object>> optimizePortfolio(@RequestBody PortfolioRequest request) {
        try {
            // Request validation
            if (request == null || request.getTickers() == null || request.getTickers().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "tickers 필드가 필요합니다."
                ));
            }
            
            // Extract parameters with defaults
            List<String> tickers = request.getTickers();
            Double riskFactor = request.getRiskFactor() != null ? request.getRiskFactor() : 0.5;
            String method = request.getMethod() != null ? request.getMethod() : "classical";
            String period = request.getPeriod() != null ? request.getPeriod() : "1y";
            Boolean autoSave = request.getAutoSave() != null ? request.getAutoSave() : false;

            // Call optimization service
            Map<String, Object> result = portfolioService.optimizePortfolio(tickers, riskFactor, method, period);
            
            // Save to database if auto-save is enabled
            if (Boolean.TRUE.equals(autoSave) && Boolean.TRUE.equals(result.get("success"))) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> resultData = (Map<String, Object>) result.get("result");
                    if (resultData != null) {
                        portfolioDataService.saveOptimizationResult(
                            resultData, tickers, riskFactor, method, period, true
                        );
                    }
                } catch (Exception e) {
                    // Log error but don't fail the request
                    System.err.println("Failed to save optimization result: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "최적화 요청 처리 중 오류: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 포트폴리오 최적화 요청 (Map 기반 - 하위 호환성)
     * 
     * @deprecated Use optimizePortfolio(PortfolioRequest) instead
     */
    @PostMapping("/optimize/legacy")
    @Deprecated
    public ResponseEntity<Map<String, Object>> optimizeLegacy(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> tickers = (List<String>) request.get("tickers");
            Double riskFactor = request.get("risk_factor") != null ? 
                ((Number) request.get("risk_factor")).doubleValue() : 0.5;
            String method = (String) request.getOrDefault("method", "classical");
            String period = (String) request.getOrDefault("period", "1y");
            
            Boolean autoSave = false;
            if (request.get("auto_save") != null) {
                if (request.get("auto_save") instanceof Boolean) {
                    autoSave = (Boolean) request.get("auto_save");
                } else if (request.get("auto_save") instanceof String) {
                    autoSave = Boolean.parseBoolean((String) request.get("auto_save"));
                }
            }

            if (tickers == null || tickers.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "tickers 필드가 필요합니다."
                ));
            }

            Map<String, Object> result = portfolioService.optimizePortfolio(tickers, riskFactor, method, period);
            
            if (Boolean.TRUE.equals(autoSave) && Boolean.TRUE.equals(result.get("success"))) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> resultData = (Map<String, Object>) result.get("result");
                    if (resultData != null) {
                        portfolioDataService.saveOptimizationResult(
                            resultData, tickers, riskFactor, method, period, true
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to save optimization result: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "최적화 요청 처리 중 오류: " + e.getMessage()
            ));
        }
    }

    /**
     * 기존 비중을 포함한 포트폴리오 최적화
     * 
     * @param request PortfolioRequest DTO (tickers, initialWeights, riskFactor, method, period, autoSave)
     * @return 최적화 결과
     */
    @PostMapping("/optimize/with-weights")
    public ResponseEntity<Map<String, Object>> optimizeWithWeights(@RequestBody PortfolioRequest request) {
        try {
            // Request validation
            if (request == null || request.getTickers() == null || request.getTickers().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "tickers 필드가 필요합니다."
                ));
            }
            
            if (request.getInitialWeights() == null || 
                request.getInitialWeights().size() != request.getTickers().size()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "initialWeights의 개수가 tickers와 일치해야 합니다."
                ));
            }
            
            // Extract parameters with defaults
            List<String> tickers = request.getTickers();
            List<Double> initialWeights = request.getInitialWeights();
            Double riskFactor = request.getRiskFactor() != null ? request.getRiskFactor() : 0.5;
            String method = request.getMethod() != null ? request.getMethod() : "quantum";
            String period = request.getPeriod() != null ? request.getPeriod() : "1y";
            Boolean autoSave = request.getAutoSave() != null ? request.getAutoSave() : false;

            // Call optimization service
            Map<String, Object> result = portfolioService.optimizeWithWeights(
                tickers, initialWeights, riskFactor, method, period
            );
            
            // Save to database if auto-save is enabled
            if (Boolean.TRUE.equals(autoSave) && Boolean.TRUE.equals(result.get("success"))) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> resultData = (Map<String, Object>) result.get("result");
                    if (resultData != null) {
                        portfolioDataService.saveOptimizationResult(
                            resultData, tickers, riskFactor, method, period, true
                        );
                    }
                } catch (Exception e) {
                    // Log error but don't fail the request
                    System.err.println("Failed to save optimization result: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "최적화 요청 처리 중 오류: " + e.getMessage()
            ));
        }
    }

    /**
     * Flask 서버 상태 확인
     */
    @GetMapping("/health/flask")
    public ResponseEntity<Map<String, Object>> checkFlaskHealth() {
        Map<String, Object> result = portfolioService.checkFlaskHealth();
        return ResponseEntity.ok(result);
    }
    
    /**
     * 실시간 주가 조회 (Flask → yfinance)
     */
    @GetMapping("/stock/price/{symbol}")
    public ResponseEntity<Map<String, Object>> getStockPrice(@PathVariable String symbol) {
        try {
            Map<String, Object> result = portfolioService.getStockPrice(symbol);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "주가 조회 실패: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 주식 검색 (Flask → yfinance / database)
     */
    @GetMapping("/stock/search")
    public ResponseEntity<Map<String, Object>> searchStocks(@RequestParam String q) {
        try {
            Map<String, Object> result = portfolioService.searchStocks(q);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "검색 실패: " + e.getMessage()
            ));
        }
    }
    
    /**
     * AI Agent 워크플로우를 사용한 최적화
     * 
     * Flow:
     * 1. Form Submission → 2. AI Agent → 3. Optimization → 
     * 4. Risk Analysis → 5. Conditional Branching → 6. Action
     */
    @PostMapping("/optimize/workflow")
    public ResponseEntity<Map<String, Object>> optimizeWithWorkflow(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = portfolioService.optimizeWithWorkflow(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "워크플로우 최적화 실패: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 워크플로우 상태 조회
     */
    @GetMapping("/workflow/{workflowId}/status")
    public ResponseEntity<Map<String, Object>> getWorkflowStatus(@PathVariable String workflowId) {
        try {
            Map<String, Object> result = portfolioService.getWorkflowStatus(workflowId);
            
            if (result.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "상태 조회 실패: " + e.getMessage()
            ));
        }
    }
}

