package com.toandfrom.toandfrom.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.*;

/**
 * 환율 API 컨트롤러
 * Exchange Rate API Controller
 * 
 * Provides real-time currency exchange rates (USD ↔ KRW)
 * 
 * @version 1.0.0
 * @since 2025-11-10
 */
@RestController
@RequestMapping("/api/currency")
@CrossOrigin(origins = "http://localhost:5173")
public class CurrencyController {

    private static final String EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";
    
    /**
     * 환율 조회
     * Get exchange rate
     * 
     * @param from Source currency (default: USD)
     * @param to Target currency (default: KRW)
     * @return Exchange rate data
     * 
     * Example:
     * GET /api/currency/rate?from=USD&to=KRW
     * Response: {
     *   "success": true,
     *   "from": "USD",
     *   "to": "KRW",
     *   "rate": 1320.50,
     *   "timestamp": 1699612345678
     * }
     */
    @GetMapping("/rate")
    public ResponseEntity<Map<String, Object>> getExchangeRate(
        @RequestParam(defaultValue = "USD") String from,
        @RequestParam(defaultValue = "KRW") String to
    ) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(EXCHANGE_RATE_API, Map.class);
            
            if (response != null && response.containsKey("rates")) {
                @SuppressWarnings("unchecked")
                Map<String, Double> rates = (Map<String, Double>) response.get("rates");
                Double rate = rates.getOrDefault(to, 1.0);
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("from", from);
                result.put("to", to);
                result.put("rate", rate);
                result.put("timestamp", System.currentTimeMillis());
                result.put("source", "ExchangeRate-API.com");
                
                return ResponseEntity.ok(result);
            }
            
            // Fallback response
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", false);
            fallback.put("error", "Failed to fetch rates from external API");
            return ResponseEntity.status(500).body(fallback);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * 환율 변환
     * Convert currency amount
     * 
     * @param request Request body containing amount, from, to
     * @return Converted amount
     * 
     * Example:
     * POST /api/currency/convert
     * Body: {
     *   "amount": 100,
     *   "from": "USD",
     *   "to": "KRW"
     * }
     * Response: {
     *   "success": true,
     *   "amount": 100,
     *   "from": "USD",
     *   "to": "KRW",
     *   "rate": 1320.50,
     *   "converted": 132050.00
     * }
     */
    @PostMapping("/convert")
    public ResponseEntity<Map<String, Object>> convert(@RequestBody Map<String, Object> request) {
        try {
            double amount = ((Number) request.get("amount")).doubleValue();
            String from = (String) request.getOrDefault("from", "USD");
            String to = (String) request.getOrDefault("to", "KRW");
            
            // Get exchange rate
            ResponseEntity<Map<String, Object>> rateResponse = getExchangeRate(from, to);
            Map<String, Object> rateData = rateResponse.getBody();
            
            if (rateData != null && (Boolean) rateData.get("success")) {
                double rate = (Double) rateData.get("rate");
                double converted = amount * rate;
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("amount", amount);
                result.put("from", from);
                result.put("to", to);
                result.put("rate", rate);
                result.put("converted", converted);
                result.put("timestamp", System.currentTimeMillis());
                
                return ResponseEntity.ok(result);
            }
            
            return rateResponse;
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * 여러 통화의 환율 조회
     * Get multiple currency rates
     * 
     * @param base Base currency (default: USD)
     * @return All available exchange rates
     * 
     * Example:
     * GET /api/currency/rates?base=USD
     * Response: {
     *   "success": true,
     *   "base": "USD",
     *   "rates": {
     *     "KRW": 1320.50,
     *     "EUR": 0.85,
     *     "JPY": 110.50,
     *     ...
     *   },
     *   "timestamp": 1699612345678
     * }
     */
    @GetMapping("/rates")
    public ResponseEntity<Map<String, Object>> getAllRates(
        @RequestParam(defaultValue = "USD") String base
    ) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(EXCHANGE_RATE_API, Map.class);
            
            if (response != null && response.containsKey("rates")) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("base", base);
                result.put("rates", response.get("rates"));
                result.put("timestamp", System.currentTimeMillis());
                
                return ResponseEntity.ok(result);
            }
            
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", false);
            fallback.put("error", "Failed to fetch rates");
            return ResponseEntity.status(500).body(fallback);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
