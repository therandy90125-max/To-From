package com.toandfrom.toandfrom.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Alpha Vantage API 클라이언트
 * 주식 검색 및 시세 조회를 위한 래퍼 클래스
 */
@Component
public class AlphaVantageClient {
    
    private static final Logger log = LoggerFactory.getLogger(AlphaVantageClient.class);
    
    private static final String BASE_URL = "https://www.alphavantage.co/query";
    private static final int MAX_RETRIES = 2;
    private static final double MIN_MATCH_SCORE = 0.5;
    
    @Value("${alphavantage.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    public AlphaVantageClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Alpha Vantage API를 사용하여 주식 심볼 검색
     * 
     * @param query 검색어
     * @return 검색 결과 목록 (매치 스코어 0.5 이상만)
     */
    public List<AlphaVantageSearchResult> searchSymbol(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Alpha Vantage API key not configured, skipping search");
            return new ArrayList<>();
        }
        
        List<AlphaVantageSearchResult> results = new ArrayList<>();
        int retryCount = 0;
        
        while (retryCount <= MAX_RETRIES) {
            try {
                // URL 인코딩 (한글 지원)
                String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
                String url = String.format("%s?function=SYMBOL_SEARCH&keywords=%s&apikey=%s",
                    BASE_URL, encodedQuery, apiKey);
                
                log.debug("Alpha Vantage API request: {}", url);
                
                @SuppressWarnings("unchecked")
                ResponseEntity<Map<String, Object>> response = 
                    restTemplate.getForEntity(url, (Class<Map<String, Object>>) (Class<?>) Map.class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    
                    // API 에러 체크
                    if (body.containsKey("Error Message")) {
                        log.warn("Alpha Vantage API error: {}", body.get("Error Message"));
                        break;
                    }
                    
                    if (body.containsKey("Note")) {
                        log.warn("Alpha Vantage API rate limit: {}", body.get("Note"));
                        // Rate limit이면 재시도하지 않음
                        break;
                    }
                    
                    @SuppressWarnings("unchecked")
                    List<Map<String, String>> bestMatches = 
                        (List<Map<String, String>>) body.get("bestMatches");
                    
                    if (bestMatches != null) {
                        for (Map<String, String> match : bestMatches) {
                            try {
                                String matchScoreStr = match.get("9. matchScore");
                                if (matchScoreStr != null) {
                                    double matchScore = Double.parseDouble(matchScoreStr);
                                    
                                    // 매치 스코어 0.5 이상만 추가
                                    if (matchScore >= MIN_MATCH_SCORE) {
                                        AlphaVantageSearchResult result = new AlphaVantageSearchResult();
                                        result.setSymbol(match.get("1. symbol"));
                                        result.setName(match.get("2. name"));
                                        result.setType(match.get("3. type"));
                                        result.setRegion(match.get("4. region"));
                                        result.setMatchScore(matchScore);
                                        
                                        results.add(result);
                                    }
                                }
                            } catch (NumberFormatException e) {
                                log.debug("Invalid match score format: {}", match.get("9. matchScore"));
                            }
                        }
                        
                        log.info("Alpha Vantage found {} results (matchScore >= {})", 
                            results.size(), MIN_MATCH_SCORE);
                        break; // 성공하면 재시도 불필요
                    }
                }
                
            } catch (org.springframework.web.client.ResourceAccessException e) {
                log.warn("Alpha Vantage API timeout/connection error (attempt {}/{}): {}", 
                    retryCount + 1, MAX_RETRIES + 1, e.getMessage());
                retryCount++;
                
                if (retryCount <= MAX_RETRIES) {
                    try {
                        // 재시도 전 대기 (지수 백오프)
                        Thread.sleep(TimeUnit.SECONDS.toMillis(1L * (retryCount)));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            } catch (Exception e) {
                log.error("Alpha Vantage API error: {}", e.getMessage(), e);
                break; // 예상치 못한 에러는 재시도하지 않음
            }
        }
        
        return results;
    }
    
    /**
     * Alpha Vantage 검색 결과 DTO
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AlphaVantageSearchResult {
        @JsonProperty("1. symbol")
        private String symbol;
        
        @JsonProperty("2. name")
        private String name;
        
        @JsonProperty("3. type")
        private String type;
        
        @JsonProperty("4. region")
        private String region;
        
        @JsonProperty("9. matchScore")
        private double matchScore;
    }
}

