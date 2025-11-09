package com.toandfrom.toandfrom.client;

import com.toandfrom.toandfrom.dto.KRXResponse;
import com.toandfrom.toandfrom.entity.Stock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * 한국거래소(KRX) Open API 클라이언트
 * 상장 종목 목록 조회
 * 
 * KRX Open API: http://openapigw.krx.co.kr/openapi/
 * 
 * Note: API 키가 필요한 경우 application.properties에 설정 필요
 */
@Component
public class KRXClient {
    
    private static final Logger log = LoggerFactory.getLogger(KRXClient.class);
    
    private static final String KRX_API_URL = "http://openapigw.krx.co.kr/openapi/";
    
    @Value("${krx.api.key:}")
    private String krxApiKey;
    
    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;
    
    private final RestTemplate restTemplate;
    
    public KRXClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * KRX 실시간 상장사 데이터 조회
     * 
     * @return 상장 종목 목록
     */
    public List<Stock> getListedStocks() {
        List<Stock> stocks = new ArrayList<>();
        
        // 1. KRX Open API 시도
        if (krxApiKey != null && !krxApiKey.trim().isEmpty()) {
            try {
                stocks = fetchFromKRXApi();
                if (!stocks.isEmpty()) {
                    log.info("✅ KRX API에서 {}개 종목 조회 성공", stocks.size());
                    return stocks;
                }
            } catch (Exception e) {
                log.warn("⚠️ KRX API 호출 실패, Flask API로 폴백: {}", e.getMessage());
                log.debug("KRX API error details: ", e);
            }
        } else {
            log.debug("KRX API 키가 설정되지 않음, Flask API 사용");
        }
        
        // 2. Flask API 폴백 (네이버 금융 크롤러)
        try {
            stocks = fetchFromFlaskApi();
            if (!stocks.isEmpty()) {
                log.info("✅ Flask API에서 {}개 종목 조회 성공", stocks.size());
                return stocks;
            }
        } catch (Exception e) {
            log.warn("⚠️ Flask API 호출 실패: {}", e.getMessage());
            log.debug("Flask API error details: ", e);
        }
        
        log.warn("❌ 모든 API 호출 실패, 빈 목록 반환");
        return stocks;
    }
    
    /**
     * KRX Open API에서 상장 종목 조회
     */
    private List<Stock> fetchFromKRXApi() {
        try {
            // KRX Open API 호출
            String url = KRX_API_URL + "StockListing?" +
                "ISU_CD=&" +
                "ISU_NM=&" +
                "Market=ALL&" +
                "pageNumber=1&" +
                "pageSize=10000&" +
                "outType=json";
            
            // API 키가 필요한 경우 URL에 추가
            if (krxApiKey != null && !krxApiKey.trim().isEmpty()) {
                url += "&apikey=" + krxApiKey;
            }
            
            log.debug("KRX API request: {}", url);
            
            ResponseEntity<KRXResponse> response = restTemplate.getForEntity(
                url,
                KRXResponse.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                KRXResponse krxResponse = response.getBody();
                if (krxResponse != null) {
                    return krxResponse.toStocks();
                }
            }
            
        } catch (Exception e) {
            log.error("❌ KRX API 호출 실패", e);
            throw e;
        }
        
        return new ArrayList<>();
    }
    
    /**
     * Flask API에서 한국 주식 목록 조회 (폴백)
     */
    private List<Stock> fetchFromFlaskApi() {
        try {
            // Flask API를 통해 네이버 금융 크롤러 사용
            String url = flaskApiUrl + "/api/stocks/korean/list";
            
            log.debug("Flask API request: {}", url);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<List<Stock>> response = 
                restTemplate.getForEntity(url, (Class<List<Stock>>) (Class<?>) List.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            
        } catch (Exception e) {
            log.warn("Flask API 호출 실패: {}", e.getMessage());
            log.debug("Flask API error details: ", e);
        }
        
        return new ArrayList<>();
    }
}

