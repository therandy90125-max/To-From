package com.toandfrom.toandfrom.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173")
public class StockSearchController {

    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 주식 검색 API
     * Flask 백엔드로 프록시하여 주식 검색 결과 반환
     * 
     * @param q 검색어 (티커 또는 회사명)
     * @return 검색 결과 리스트
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStocks(@RequestParam String q) {
        try {
            // Flask 백엔드로 프록시
            String url = flaskApiUrl + "/api/stocks/search?q=" + q;
            System.out.println("Calling Flask: " + url);
            
            @SuppressWarnings("unchecked")
            List<Map<String, String>> results = restTemplate.getForObject(url, List.class);
            
            System.out.println("Flask returned " + (results != null ? results.size() : 0) + " results");
            if (results != null && !results.isEmpty()) {
                System.out.println("First result: " + results.get(0));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("results", results != null ? results : new ArrayList<>());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error calling Flask stock search: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "주식 검색 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("results", new ArrayList<>());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * 특정 주식 정보 조회 (선택사항)
     * 
     * @param ticker 주식 티커
     * @return 주식 상세 정보
     */
    @GetMapping("/info/{ticker}")
    public ResponseEntity<Map<String, Object>> getStockInfo(@PathVariable String ticker) {
        try {
            String url = flaskApiUrl + "/api/stocks/info/" + ticker;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> info = restTemplate.getForObject(url, Map.class);
            
            return ResponseEntity.ok(info != null ? info : new HashMap<>());
            
        } catch (Exception e) {
            System.err.println("Error getting stock info: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "주식 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
