package com.toandfrom.toandfrom.repository;

import com.toandfrom.toandfrom.entity.PortfolioResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PortfolioResultRepository extends JpaRepository<PortfolioResult, Long> {
    
    List<PortfolioResult> findByOrderByCreatedAtDesc();
    
    List<PortfolioResult> findByAutoSavedTrueOrderByCreatedAtDesc();
    
    List<PortfolioResult> findByMethodOrderByCreatedAtDesc(String method);
    
    List<PortfolioResult> findByCreatedAtAfter(LocalDateTime date);
}

