package com.toandfrom.toandfrom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioOptimizationService {

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
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("tickers", tickers);
        requestBody.put("initial_weights", initialWeights);
        requestBody.put("risk_factor", riskFactor != null ? riskFactor : 0.5);
        requestBody.put("method", method != null ? method : "quantum");
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
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("results", response.getBody());
            return result;
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "검색 실패: " + e.getMessage());
            return errorResponse;
        }
    }
}

