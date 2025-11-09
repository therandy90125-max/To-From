package com.toandfrom.toandfrom.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 주식 마스터 엔티티
 * 실시간 동기화를 위한 주식 정보
 */
@Entity
@Table(name = "stock_master", indexes = {
    @Index(name = "idx_symbol", columnList = "symbol"),
    @Index(name = "idx_market", columnList = "market"),
    @Index(name = "idx_name", columnList = "name"),
    @Index(name = "idx_is_active", columnList = "isActive")
})
@Data
public class Stock {
    
    @Id
    private String id;  // kr_005930 또는 us_aapl
    
    @Column(unique = true, nullable = false, length = 20)
    private String symbol;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(name = "name_ko", length = 200)
    private String nameKo;  // 한국 주식만
    
    @Column(nullable = false, length = 20)
    private String market;  // KOSPI, KOSDAQ, US
    
    @Column(length = 20)
    private String type;    // STOCK, ETF, FUND
    
    // 실시간 동기화를 위한 필드
    @Column(name = "is_active")
    private Boolean isActive;  // true: 정상 거래, false: 상장폐지
    
    @Column(name = "listed_date")
    private LocalDateTime listedDate;  // 상장일
    
    @Column(name = "delisted_date")
    private LocalDateTime delistedDate;  // 상장폐지일 (null이면 정상)
    
    @Column(name = "last_verified")
    private LocalDateTime lastVerified;  // 마지막 검증 시각
    
    @Column(length = 50)
    private String source;  // KRX, SEC, ALPHA_VANTAGE, YFINANCE, NAVER
    
    @Column(name = "sector", length = 100)
    private String sector;  // 섹터 정보
    
    @Column(name = "exchange", length = 50)
    private String exchange;  // 거래소 정보 (KOSPI, KOSDAQ, NASDAQ, NYSE 등)
    
    @Version  // 낙관적 잠금 (동시 업데이트 방지)
    private Long version;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (lastVerified == null) {
            lastVerified = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

