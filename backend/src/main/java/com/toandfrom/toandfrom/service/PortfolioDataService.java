package com.toandfrom.toandfrom.service;

import com.toandfrom.toandfrom.entity.PortfolioResult;
import com.toandfrom.toandfrom.entity.StockWeight;
import com.toandfrom.toandfrom.repository.PortfolioResultRepository;
import com.toandfrom.toandfrom.repository.StockWeightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioDataService {
    
    private final PortfolioResultRepository portfolioResultRepository;
    private final StockWeightRepository stockWeightRepository;
    
    public PortfolioDataService(
            PortfolioResultRepository portfolioResultRepository,
            StockWeightRepository stockWeightRepository) {
        this.portfolioResultRepository = portfolioResultRepository;
        this.stockWeightRepository = stockWeightRepository;
    }
    
    /**
     * Save optimization result to database
     * @param result The optimization result from Flask
     * @param tickers List of tickers
     * @param riskFactor Risk factor used
     * @param method Optimization method ("classical" or "quantum")
     * @param period Data period
     * @param autoSaved Whether this was auto-saved
     * @return Saved PortfolioResult entity
     */
    @Transactional
    public PortfolioResult saveOptimizationResult(
            Map<String, Object> result,
            List<String> tickers,
            Double riskFactor,
            String method,
            String period,
            Boolean autoSaved) {
        
        PortfolioResult portfolioResult = new PortfolioResult();
        portfolioResult.setTickers(String.join(",", tickers));
        portfolioResult.setRiskFactor(riskFactor);
        portfolioResult.setMethod(method);
        portfolioResult.setPeriod(period);
        portfolioResult.setAutoSaved(autoSaved != null && autoSaved);
        
        // Extract optimized portfolio data
        @SuppressWarnings("unchecked")
        Map<String, Object> optimized = (Map<String, Object>) result.get("optimized");
        
        if (optimized != null) {
            portfolioResult.setExpectedReturn(
                getDoubleValue(optimized.get("expected_return"))
            );
            portfolioResult.setRisk(
                getDoubleValue(optimized.get("risk"))
            );
            portfolioResult.setSharpeRatio(
                getDoubleValue(optimized.get("sharpe_ratio"))
            );
            
            // Save optimized stock weights
            @SuppressWarnings("unchecked")
            List<String> optimizedTickers = (List<String>) optimized.get("tickers");
            @SuppressWarnings("unchecked")
            List<Double> optimizedWeights = (List<Double>) optimized.get("weights");
            
            if (optimizedTickers != null && optimizedWeights != null) {
                List<StockWeight> stockWeights = new ArrayList<>();
                for (int i = 0; i < optimizedTickers.size() && i < optimizedWeights.size(); i++) {
                    StockWeight stockWeight = new StockWeight(
                        optimizedTickers.get(i),
                        optimizedWeights.get(i),
                        true
                    );
                    stockWeight.setPortfolioResult(portfolioResult);
                    stockWeights.add(stockWeight);
                }
                portfolioResult.setStockWeights(stockWeights);
            }
        } else {
            // Handle case where result structure is different (from /api/optimize endpoint)
            portfolioResult.setExpectedReturn(
                getDoubleValue(result.get("expected_return"))
            );
            portfolioResult.setRisk(
                getDoubleValue(result.get("risk"))
            );
            portfolioResult.setSharpeRatio(
                getDoubleValue(result.get("sharpe_ratio"))
            );
            
            @SuppressWarnings("unchecked")
            List<String> resultTickers = (List<String>) result.get("selected_tickers");
            @SuppressWarnings("unchecked")
            List<Double> resultWeights = (List<Double>) result.get("weights");
            
            if (resultTickers != null && resultWeights != null) {
                List<StockWeight> stockWeights = new ArrayList<>();
                for (int i = 0; i < resultTickers.size() && i < resultWeights.size(); i++) {
                    StockWeight stockWeight = new StockWeight(
                        resultTickers.get(i),
                        resultWeights.get(i),
                        true
                    );
                    stockWeight.setPortfolioResult(portfolioResult);
                    stockWeights.add(stockWeight);
                }
                portfolioResult.setStockWeights(stockWeights);
            }
        }
        
        // Extract original portfolio data (if available)
        @SuppressWarnings("unchecked")
        Map<String, Object> original = (Map<String, Object>) result.get("original");
        if (original != null) {
            portfolioResult.setOriginalExpectedReturn(
                getDoubleValue(original.get("expected_return"))
            );
            portfolioResult.setOriginalRisk(
                getDoubleValue(original.get("risk"))
            );
            portfolioResult.setOriginalSharpeRatio(
                getDoubleValue(original.get("sharpe_ratio"))
            );
            
            // Save original stock weights
            @SuppressWarnings("unchecked")
            List<String> originalTickers = (List<String>) original.get("tickers");
            @SuppressWarnings("unchecked")
            List<Double> originalWeights = (List<Double>) original.get("weights");
            
            if (originalTickers != null && originalWeights != null) {
                List<StockWeight> originalStockWeights = new ArrayList<>();
                for (int i = 0; i < originalTickers.size() && i < originalWeights.size(); i++) {
                    StockWeight stockWeight = new StockWeight(
                        originalTickers.get(i),
                        originalWeights.get(i),
                        false
                    );
                    stockWeight.setPortfolioResult(portfolioResult);
                    originalStockWeights.add(stockWeight);
                }
                // Merge with existing weights
                portfolioResult.getStockWeights().addAll(originalStockWeights);
            }
        }
        
        // Extract improvements (if available)
        @SuppressWarnings("unchecked")
        Map<String, Object> improvements = (Map<String, Object>) result.get("improvements");
        if (improvements != null) {
            portfolioResult.setReturnImprovement(
                getDoubleValue(improvements.get("return_improvement"))
            );
            portfolioResult.setRiskChange(
                getDoubleValue(improvements.get("risk_change"))
            );
            portfolioResult.setSharpeImprovement(
                getDoubleValue(improvements.get("sharpe_improvement"))
            );
        }
        
        return portfolioResultRepository.save(portfolioResult);
    }
    
    /**
     * Get all portfolio results
     */
    public List<PortfolioResult> getAllResults() {
        return portfolioResultRepository.findByOrderByCreatedAtDesc();
    }
    
    /**
     * Get auto-saved portfolio results
     */
    public List<PortfolioResult> getAutoSavedResults() {
        return portfolioResultRepository.findByAutoSavedTrueOrderByCreatedAtDesc();
    }
    
    /**
     * Get portfolio result by ID
     */
    public PortfolioResult getResultById(Long id) {
        return portfolioResultRepository.findById(id).orElse(null);
    }
    
    /**
     * Helper method to safely extract Double value from Object
     */
    private Double getDoubleValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}

