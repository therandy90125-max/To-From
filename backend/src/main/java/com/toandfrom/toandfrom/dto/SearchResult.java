package com.toandfrom.toandfrom.dto;

import com.toandfrom.toandfrom.entity.Stock;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 주식 검색 결과 DTO
 * 캐시 또는 API에서 검색된 결과와 출처 정보 포함
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResult {
    
    /**
     * 검색된 주식 목록
     */
    private List<Stock> stocks;
    
    /**
     * 결과 출처
     * - "CACHE": 캐시에서만 검색
     * - "API": API에서만 검색
     * - "HYBRID": 캐시 + API 병합
     */
    private String source;
    
    /**
     * 검색 쿼리
     */
    private String query;
    
    /**
     * 마켓 필터
     */
    private String market;
    
    /**
     * 검색 결과 수
     */
    public int getCount() {
        return stocks != null ? stocks.size() : 0;
    }
    
    /**
     * 결과가 비어있는지 확인
     */
    public boolean isEmpty() {
        return stocks == null || stocks.isEmpty();
    }
}

