package com.toandfrom.toandfrom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioOptimizationService {
    
    private static final Logger logger = LoggerFactory.getLogger(PortfolioOptimizationService.class);

    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;

    private final RestTemplate restTemplate;

    public PortfolioOptimizationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Flask 백엔드로 포트폴리오 최적화 요청 전달
     */
    public Map<String, Object> optimizePortfolio(List<String> tickers, Double riskFactor, String method, String period) {
        String url = flaskApiUrl + "/api/optimize";
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("tickers", tickers);
        requestBody.put("risk_factor", riskFactor != null ? riskFactor : 0.5);
        requestBody.put("method", method != null ? method : "classical");
        requestBody.put("period", period != null ? period : "1y");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Flask 서버 연결 실패: " + e.getMessage());
            return errorResponse;
        }
    }

    /**
     * 기존 비중을 포함한 포트폴리오 최적화 요청
     */
    public Map<String, Object> optimizeWithWeights(List<String> tickers, List<Double> initialWeights, 
                                                   Double riskFactor, String method, String period) {
        String url = flaskApiUrl + "/api/optimize/with-weights";
        
        // 📦 디버깅: Flask로 전송하는 데이터 확인
        logger.info("📤 Sending to Flask: {}", url);
        logger.info("   → tickers: {} (개수: {})", tickers, tickers != null ? tickers.size() : 0);
        logger.info("   → initial_weights: {} (개수: {})", initialWeights, initialWeights != null ? initialWeights.size() : 0);
        
        // Flask 서버 상태 먼저 확인
        try {
            Map<String, Object> healthCheck = checkFlaskHealth();
            if (!"healthy".equals(healthCheck.get("status")) && !"ok".equals(healthCheck.get("status"))) {
                logger.warn("⚠️ Flask 서버 상태 불량: {}", healthCheck);
            }
        } catch (Exception e) {
            logger.warn("⚠️ Flask 서버 상태 확인 실패 (계속 진행): {}", e.getMessage());
        }
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("tickers", tickers);
        requestBody.put("initial_weights", initialWeights);
        requestBody.put("risk_factor", riskFactor != null ? riskFactor : 0.5);
        requestBody.put("method", method != null ? method : "quantum");
        requestBody.put("period", period != null ? period : "1y");
        requestBody.put("fast_mode", true);  // 속도 최적화

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            logger.info("🔄 Sending POST request to Flask...");
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            logger.info("✅ Received response from Flask: {}", response.getStatusCode());
            return response.getBody();
        } catch (org.springframework.web.client.ResourceAccessException e) {
            // 연결 타임아웃 또는 연결 거부
            logger.error("❌ Flask 서버 연결 실패 (ResourceAccessException): {}", e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("timeout")) {
                logger.error("💡 Flask 서버 응답이 너무 느립니다. 서버가 실행 중인지 확인하세요.");
            } else if (e.getMessage() != null && e.getMessage().contains("Connection refused")) {
                logger.error("💡 Flask 서버가 실행되지 않았습니다. http://localhost:5000 에서 실행 중인지 확인하세요.");
            }
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Flask 서버 연결 실패: " + e.getMessage() + 
                " (Flask 서버가 http://localhost:5000 에서 실행 중인지 확인하세요)");
            return errorResponse;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // 4xx 에러
            logger.error("❌ Flask 서버 HTTP 에러 ({}): {}", e.getStatusCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Flask 서버 HTTP 에러 (" + e.getStatusCode() + "): " + e.getMessage());
            return errorResponse;
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            // 5xx 에러
            logger.error("❌ Flask 서버 내부 에러 ({}): {}", e.getStatusCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Flask 서버 내부 에러 (" + e.getStatusCode() + "): " + e.getMessage());
            return errorResponse;
        } catch (Exception e) {
            logger.error("❌ Flask 서버 연결 실패 (예외): {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Flask 서버 연결 실패: " + e.getMessage() + 
                " (Flask 서버가 http://localhost:5000 에서 실행 중인지 확인하세요)");
            return errorResponse;
        }
    }

    /**
     * Flask 서버 상태 확인
     */
    public Map<String, Object> checkFlaskHealth() {
        String url = flaskApiUrl + "/api/health";
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "unhealthy");
            errorResponse.put("error", "Flask 서버 연결 실패: " + e.getMessage());
            return errorResponse;
        }
    }
    
    /**
     * 실시간 주가 조회 (Flask → yfinance)
     */
    public Map<String, Object> getStockPrice(String symbol) {
        String url = flaskApiUrl + "/api/stock/price/" + symbol;
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "주가 조회 실패: " + e.getMessage());
            return errorResponse;
        }
    }
    
    /**
     * 주식 검색
     */
    public Map<String, Object> searchStocks(String query) {
        String url = flaskApiUrl + "/api/stocks/search?q=" + query;
        
        try {
            // Flask returns an array, not a map
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("results", response.getBody());
            return result;
        } catch (Exception e) {
            logger.error("Stock search error: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "검색 실패: " + e.getMessage());
            errorResponse.put("results", new ArrayList<>());
            return errorResponse;
        }
    }
    
    /**
     * AI Agent 워크플로우를 사용한 최적화
     */
    public Map<String, Object> optimizeWithWorkflow(Map<String, Object> request) {
        String url = flaskApiUrl + "/api/optimize/workflow";
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "워크플로우 실패: " + e.getMessage());
            return errorResponse;
        }
    }
    
    /**
     * 워크플로우 상태 조회
     */
    public Map<String, Object> getWorkflowStatus(String workflowId) {
        String url = flaskApiUrl + "/api/workflow/" + workflowId + "/status";
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "상태 조회 실패: " + e.getMessage());
            return errorResponse;
        }
    }
}

