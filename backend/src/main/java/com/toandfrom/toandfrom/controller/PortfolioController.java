package com.toandfrom.toandfrom.controller;

import com.toandfrom.toandfrom.service.PortfolioOptimizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:5173")
public class PortfolioController {

    private final PortfolioOptimizationService portfolioService;

    public PortfolioController(PortfolioOptimizationService portfolioService) {
        this.portfolioService = portfolioService;
    }

    /**
     * 포트폴리오 최적화 요청 (Spring Boot → Flask)
     */
    @PostMapping("/optimize")
    public ResponseEntity<Map<String, Object>> optimize(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> tickers = (List<String>) request.get("tickers");
            Double riskFactor = request.get("risk_factor") != null ? 
                ((Number) request.get("risk_factor")).doubleValue() : 0.5;
            String method = (String) request.getOrDefault("method", "classical");
            String period = (String) request.getOrDefault("period", "1y");

            if (tickers == null || tickers.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "tickers 필드가 필요합니다."
                ));
            }

            Map<String, Object> result = portfolioService.optimizePortfolio(tickers, riskFactor, method, period);
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
     */
    @PostMapping("/optimize/with-weights")
    public ResponseEntity<Map<String, Object>> optimizeWithWeights(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> tickers = (List<String>) request.get("tickers");
            @SuppressWarnings("unchecked")
            List<Double> initialWeights = (List<Double>) request.get("initial_weights");
            Double riskFactor = request.get("risk_factor") != null ? 
                ((Number) request.get("risk_factor")).doubleValue() : 0.5;
            String method = (String) request.getOrDefault("method", "quantum");
            String period = (String) request.getOrDefault("period", "1y");

            if (tickers == null || tickers.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "tickers 필드가 필요합니다."
                ));
            }

            if (initialWeights == null || initialWeights.size() != tickers.size()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "initial_weights의 개수가 tickers와 일치해야 합니다."
                ));
            }

            Map<String, Object> result = portfolioService.optimizeWithWeights(
                tickers, initialWeights, riskFactor, method, period
            );
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
}

