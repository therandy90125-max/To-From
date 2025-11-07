package com.toandfrom.toandfrom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {
    
    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;
    
    private final RestTemplate restTemplate;
    
    public ChatbotService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Forward chatbot request to Flask backend
     */
    public Map<String, Object> chat(String message, List<Map<String, Object>> history, String language) {
        String url = flaskApiUrl + "/api/chatbot/chat";
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("message", message);
        if (history != null) {
            requestBody.put("history", history);
        }
        if (language != null) {
            requestBody.put("language", language);
        }
        
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
}

