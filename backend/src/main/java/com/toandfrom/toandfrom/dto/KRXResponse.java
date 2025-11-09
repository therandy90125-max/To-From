package com.toandfrom.toandfrom.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.toandfrom.toandfrom.entity.Stock;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * KRX Open API 응답 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class KRXResponse {
    
    @JsonProperty("OutBlock_1")
    private List<KRXStockData> outBlock1;
    
    /**
     * KRX 응답을 Stock 리스트로 변환
     */
    public List<Stock> toStocks() {
        List<Stock> stocks = new ArrayList<>();
        
        if (outBlock1 == null) {
            return stocks;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        for (KRXStockData data : outBlock1) {
            if (data == null || data.getIsuCd() == null || data.getIsuCd().trim().isEmpty()) {
                continue;
            }
            
            Stock stock = new Stock();
            
            // ID 생성: kr_005930
            String symbol = data.getIsuCd().trim();
            stock.setId("kr_" + symbol);
            stock.setSymbol(symbol);
            
            // 회사명
            stock.setName(data.getIsuNm() != null ? data.getIsuNm().trim() : symbol);
            stock.setNameKo(data.getIsuKorNm() != null ? data.getIsuKorNm().trim() : stock.getName());
            
            // 마켓 감지
            String market = data.getMktNm();
            if (market != null) {
                if (market.contains("코스피") || market.contains("KOSPI")) {
                    stock.setMarket("KR");
                    stock.setExchange("KOSPI");
                } else if (market.contains("코스닥") || market.contains("KOSDAQ")) {
                    stock.setMarket("KR");
                    stock.setExchange("KOSDAQ");
                } else {
                    stock.setMarket("KR");
                }
            } else {
                stock.setMarket("KR");
            }
            
            // 타입
            stock.setType("STOCK");
            
            // 섹터
            if (data.getSectTpNm() != null) {
                stock.setSector(data.getSectTpNm().trim());
            }
            
            // 활성 상태
            stock.setIsActive(true);
            stock.setLastVerified(now);
            stock.setSource("KRX");
            
            // 상장일 파싱 (선택사항)
            if (data.getListDd() != null && !data.getListDd().trim().isEmpty()) {
                try {
                    // KRX 날짜 형식: "YYYYMMDD"
                    String listDd = data.getListDd().trim();
                    if (listDd.length() == 8) {
                        int year = Integer.parseInt(listDd.substring(0, 4));
                        int month = Integer.parseInt(listDd.substring(4, 6));
                        int day = Integer.parseInt(listDd.substring(6, 8));
                        stock.setListedDate(LocalDateTime.of(year, month, day, 0, 0));
                    }
                } catch (Exception e) {
                    // 날짜 파싱 실패 시 무시
                }
            }
            
            stocks.add(stock);
        }
        
        return stocks;
    }
    
    /**
     * KRX 주식 데이터 내부 클래스
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KRXStockData {
        @JsonProperty("ISU_CD")
        private String isuCd;  // 종목코드
        
        @JsonProperty("ISU_NM")
        private String isuNm;  // 종목명
        
        @JsonProperty("ISU_KOR_NM")
        private String isuKorNm;  // 종목한글명
        
        @JsonProperty("MKT_NM")
        private String mktNm;  // 시장명 (코스피, 코스닥)
        
        @JsonProperty("SECT_TP_NM")
        private String sectTpNm;  // 섹터명
        
        @JsonProperty("LIST_DD")
        private String listDd;  // 상장일
        
        @JsonProperty("DELIST_DD")
        private String delistDd;  // 상장폐지일
    }
}

