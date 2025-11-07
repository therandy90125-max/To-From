package com.toandfrom.toandfrom.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_weights")
public class StockWeight {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_result_id", nullable = false)
    private PortfolioResult portfolioResult;
    
    @Column(nullable = false)
    private String ticker;
    
    @Column(nullable = false)
    private Double weight;
    
    // Indicates if this is original or optimized weight
    @Column(nullable = false)
    private Boolean isOptimized = true;
    
    public StockWeight() {
    }
    
    public StockWeight(String ticker, Double weight, Boolean isOptimized) {
        this.ticker = ticker;
        this.weight = weight;
        this.isOptimized = isOptimized;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public PortfolioResult getPortfolioResult() {
        return portfolioResult;
    }
    
    public void setPortfolioResult(PortfolioResult portfolioResult) {
        this.portfolioResult = portfolioResult;
    }
    
    public String getTicker() {
        return ticker;
    }
    
    public void setTicker(String ticker) {
        this.ticker = ticker;
    }
    
    public Double getWeight() {
        return weight;
    }
    
    public void setWeight(Double weight) {
        this.weight = weight;
    }
    
    public Boolean getIsOptimized() {
        return isOptimized;
    }
    
    public void setIsOptimized(Boolean isOptimized) {
        this.isOptimized = isOptimized;
    }
}

