package com.toandfrom.toandfrom.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Portfolio Optimization Request DTO
 * 포트폴리오 최적화 요청 DTO
 */
public class PortfolioRequest {
    
    /**
     * Stock ticker symbols (e.g., ["AAPL", "GOOGL", "MSFT"])
     * 주식 티커 심볼 목록
     */
    private List<String> tickers;
    
    /**
     * Risk factor (0.0 to 1.0)
     * 0.0 = 최소 위험 (보수적)
     * 1.0 = 최대 위험 (공격적)
     * 위험 인수 (0.0 ~ 1.0)
     */
    private Double riskFactor;
    
    /**
     * Optimization method: "classical" or "quantum"
     * 최적화 방법: "classical" 또는 "quantum"
     */
    private String method;
    
    /**
     * Historical data period: "1y", "2y", "5y", etc.
     * 과거 데이터 기간: "1y", "2y", "5y" 등
     */
    private String period;
    
    /**
     * Auto-save optimization result to database
     * 최적화 결과를 데이터베이스에 자동 저장 여부
     */
    private Boolean autoSave;
    
    /**
     * Initial weights (optional, for optimizeWithWeights endpoint)
     * 초기 비중 (선택사항, optimizeWithWeights 엔드포인트용)
     * 
     * @JsonProperty: 프론트엔드에서 "initial_weights" (snake_case)로 보내도 자동 매핑
     */
    @JsonProperty("initial_weights")
    private List<Double> initialWeights;
    
    // Constructors
    public PortfolioRequest() {
    }
    
    public PortfolioRequest(List<String> tickers, Double riskFactor, String method, String period) {
        this.tickers = tickers;
        this.riskFactor = riskFactor;
        this.method = method;
        this.period = period;
    }
    
    // Getters and Setters
    public List<String> getTickers() {
        return tickers;
    }
    
    public void setTickers(List<String> tickers) {
        this.tickers = tickers;
    }
    
    public Double getRiskFactor() {
        return riskFactor;
    }
    
    public void setRiskFactor(Double riskFactor) {
        this.riskFactor = riskFactor;
    }
    
    public String getMethod() {
        return method;
    }
    
    public void setMethod(String method) {
        this.method = method;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public Boolean getAutoSave() {
        return autoSave;
    }
    
    public void setAutoSave(Boolean autoSave) {
        this.autoSave = autoSave;
    }
    
    public List<Double> getInitialWeights() {
        return initialWeights;
    }
    
    public void setInitialWeights(List<Double> initialWeights) {
        this.initialWeights = initialWeights;
    }
}

