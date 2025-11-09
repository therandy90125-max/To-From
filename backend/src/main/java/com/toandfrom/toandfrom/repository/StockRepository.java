package com.toandfrom.toandfrom.repository;

import com.toandfrom.toandfrom.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 주식 마스터 Repository
 */
@Repository
public interface StockRepository extends JpaRepository<Stock, String> {
    
    /**
     * 심볼과 마켓으로 조회
     */
    Optional<Stock> findBySymbolAndMarket(String symbol, String market);
    
    /**
     * 마켓별 조회
     */
    List<Stock> findByMarket(String market);
    
    /**
     * 활성 주식만 조회
     */
    List<Stock> findByMarketAndIsActiveTrue(String market);
    
    /**
     * 이름으로 검색 (한글명 포함)
     */
    @Query("SELECT s FROM Stock s WHERE s.market = :market " +
           "AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.nameKo) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND s.isActive = true")
    List<Stock> searchByMarketAndQuery(
        @Param("market") String market, 
        @Param("query") String query
    );
    
    /**
     * 마지막 검증 시각이 특정 시간 이전인 주식 조회
     */
    List<Stock> findByMarketAndLastVerifiedBefore(String market, LocalDateTime before);
    
    /**
     * 마켓별 활성 주식 수
     */
    long countByMarketAndIsActiveTrue(String market);
    
    /**
     * 상장폐지된 주식 조회 (delistedDate가 null이 아닌 경우)
     */
    List<Stock> findByDelistedDateIsNotNull();
    
    /**
     * 특정 기간 내 상장된 주식 조회
     */
    List<Stock> findByListedDateBetween(LocalDateTime start, LocalDateTime end);
}

