package com.toandfrom.toandfrom.repository;

import com.toandfrom.toandfrom.entity.StockWeight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockWeightRepository extends JpaRepository<StockWeight, Long> {
    
    List<StockWeight> findByPortfolioResultId(Long portfolioResultId);
}

