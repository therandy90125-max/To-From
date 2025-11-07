package com.toandfrom.toandfrom.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "portfolio_results")
public class PortfolioResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String tickers; // Comma-separated tickers
    
    @Column(nullable = false)
    private Double riskFactor;
    
    @Column(nullable = false)
    private String method; // "classical" or "quantum"
    
    @Column(nullable = false)
    private String period; // "1y", "6mo", "3mo", etc.
    
    // Optimized portfolio metrics
    @Column(nullable = false)
    private Double expectedReturn;
    
    @Column(nullable = false)
    private Double risk;
    
    @Column(nullable = false)
    private Double sharpeRatio;
    
    // Original portfolio metrics (if available)
    private Double originalExpectedReturn;
    private Double originalRisk;
    private Double originalSharpeRatio;
    
    // Improvements (if available)
    private Double returnImprovement;
    private Double riskChange;
    private Double sharpeImprovement;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "portfolioResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockWeight> stockWeights = new ArrayList<>();
    
    // Auto-save flag
    @Column(nullable = false)
    private Boolean autoSaved = false;
    
    public PortfolioResult() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTickers() {
        return tickers;
    }
    
    public void setTickers(String tickers) {
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
    
    public Double getExpectedReturn() {
        return expectedReturn;
    }
    
    public void setExpectedReturn(Double expectedReturn) {
        this.expectedReturn = expectedReturn;
    }
    
    public Double getRisk() {
        return risk;
    }
    
    public void setRisk(Double risk) {
        this.risk = risk;
    }
    
    public Double getSharpeRatio() {
        return sharpeRatio;
    }
    
    public void setSharpeRatio(Double sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }
    
    public Double getOriginalExpectedReturn() {
        return originalExpectedReturn;
    }
    
    public void setOriginalExpectedReturn(Double originalExpectedReturn) {
        this.originalExpectedReturn = originalExpectedReturn;
    }
    
    public Double getOriginalRisk() {
        return originalRisk;
    }
    
    public void setOriginalRisk(Double originalRisk) {
        this.originalRisk = originalRisk;
    }
    
    public Double getOriginalSharpeRatio() {
        return originalSharpeRatio;
    }
    
    public void setOriginalSharpeRatio(Double originalSharpeRatio) {
        this.originalSharpeRatio = originalSharpeRatio;
    }
    
    public Double getReturnImprovement() {
        return returnImprovement;
    }
    
    public void setReturnImprovement(Double returnImprovement) {
        this.returnImprovement = returnImprovement;
    }
    
    public Double getRiskChange() {
        return riskChange;
    }
    
    public void setRiskChange(Double riskChange) {
        this.riskChange = riskChange;
    }
    
    public Double getSharpeImprovement() {
        return sharpeImprovement;
    }
    
    public void setSharpeImprovement(Double sharpeImprovement) {
        this.sharpeImprovement = sharpeImprovement;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<StockWeight> getStockWeights() {
        return stockWeights;
    }
    
    public void setStockWeights(List<StockWeight> stockWeights) {
        this.stockWeights = stockWeights;
    }
    
    public Boolean getAutoSaved() {
        return autoSaved;
    }
    
    public void setAutoSaved(Boolean autoSaved) {
        this.autoSaved = autoSaved;
    }
}

