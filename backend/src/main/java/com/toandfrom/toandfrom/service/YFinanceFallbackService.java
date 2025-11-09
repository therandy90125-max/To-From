package com.toandfrom.toandfrom.service;

import com.toandfrom.toandfrom.dto.StockSearchResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * yfinance 폴백 서비스
 * 6자리 한국 주식 코드 자동 변환 및 미국 심볼 조회
 * 
 * Note: 실제 yfinance 호출은 Flask 백엔드에서 처리되므로,
 * 이 서비스는 티커 변환 로직만 제공합니다.
 */
@Service
public class YFinanceFallbackService {
    
    private static final Logger log = LoggerFactory.getLogger(YFinanceFallbackService.class);
    
    /**
     * 한국 주식 6자리 코드를 yfinance 형식으로 변환
     * 
     * @param code 6자리 숫자 코드
     * @return 변환된 티커 리스트 (.KS, .KQ)
     */
    public List<String> convertKoreanCode(String code) {
        List<String> tickers = new ArrayList<>();
        
        if (code == null || !code.matches("\\d{6}")) {
            return tickers;
        }
        
        // .KS (KOSPI) 먼저 시도
        tickers.add(code + ".KS");
        // .KQ (KOSDAQ) 시도
        tickers.add(code + ".KQ");
        
        log.debug("Converted Korean code {} to tickers: {}", code, tickers);
        return tickers;
    }
    
    /**
     * 미국 주식 심볼이 yfinance로 조회 가능한지 확인
     * 
     * @param symbol 심볼
     * @return 조회 가능 여부
     */
    public boolean isUsSymbol(String symbol) {
        if (symbol == null || symbol.trim().isEmpty()) {
            return false;
        }
        
        // 한국 주식 코드 형식 제외 (6자리 숫자 또는 .KS/.KQ로 끝나는 경우)
        if (symbol.matches("\\d{6}(\\.KS|\\.KQ)?")) {
            return false;
        }
        
        // 일반적인 미국 주식 심볼 형식 (1-5자리 알파벳, 숫자, 점 포함)
        return symbol.matches("^[A-Z0-9.]{1,5}$");
    }
    
    /**
     * yfinance 조회 실패 시 빈 리스트 반환 (예외 아님)
     * 
     * @param ticker 티커
     * @return 빈 리스트
     */
    public List<StockSearchResponseDTO> getEmptyResult(String ticker) {
        log.debug("yfinance lookup failed for {}, returning empty result", ticker);
        return new ArrayList<>();
    }
    
    /**
     * yfinance 조회 성공 로그
     * 
     * @param ticker 티커
     * @param name 회사명
     */
    public void logSuccess(String ticker, String name) {
        log.info("yfinance lookup successful: {} - {}", ticker, name);
    }
    
    /**
     * yfinance 조회 실패 로그
     * 
     * @param ticker 티커
     * @param error 에러 메시지
     */
    public void logFailure(String ticker, String error) {
        log.debug("yfinance lookup failed for {}: {}", ticker, error);
    }
}

