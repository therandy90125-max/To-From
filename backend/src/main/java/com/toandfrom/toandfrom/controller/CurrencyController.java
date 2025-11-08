package com.toandfrom.toandfrom.controller;

import com.toandfrom.toandfrom.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/currency")
@RequiredArgsConstructor
// CORS는 WebConfig에서 전역 설정됨
public class CurrencyController {

    private final CurrencyService currencyService;

    /**
     * 환율 조회 API
     * 
     * @param from 원본 통화 (USD, KRW)
     * @param to 대상 통화 (USD, KRW)
     * @return 환율 정보
     */
    @GetMapping("/rate")
    public ResponseEntity<?> getExchangeRate(
            @RequestParam String from,
            @RequestParam String to
    ) {
        try {
            log.info("Exchange rate request: {} to {}", from, to);
            
            BigDecimal rate = currencyService.getExchangeRate(from, to);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "from", from,
                "to", to,
                "rate", rate.doubleValue(),
                "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            log.error("Failed to get exchange rate: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "환율 조회 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 통화 변환 API
     * 
     * @param amount 변환할 금액
     * @param from 원본 통화
     * @param to 대상 통화
     * @return 변환된 금액
     */
    @GetMapping("/convert")
    public ResponseEntity<?> convertCurrency(
            @RequestParam BigDecimal amount,
            @RequestParam String from,
            @RequestParam String to
    ) {
        try {
            log.info("Currency conversion: {} {} to {}", amount, from, to);
            
            BigDecimal converted = currencyService.convert(amount, from, to);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "originalAmount", amount.doubleValue(),
                "originalCurrency", from,
                "convertedAmount", converted.doubleValue(),
                "convertedCurrency", to,
                "rate", currencyService.getExchangeRate(from, to).doubleValue()
            ));
            
        } catch (Exception e) {
            log.error("Failed to convert currency: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "통화 변환 실패: " + e.getMessage()
            ));
        }
    }
}

