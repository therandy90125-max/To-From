package com.toandfrom.toandfrom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * RestTemplate 설정 (완전 버전)
 * 
 * 개선 사항:
 * 1. String + JSON 모두 UTF-8 처리
 * 2. Accept-Charset 헤더 최적화
 * 3. 타임아웃 QAOA 실행시간 고려
 * 4. 에러 핸들링 개선
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        // ================================
        // 1. Request Factory 설정
        // ================================
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);        // 연결 타임아웃: 10초
        factory.setReadTimeout(600000);          // 읽기 타임아웃: 10분 (QAOA 실행)
        
        RestTemplate restTemplate = new RestTemplate(factory);
        
        // ================================
        // 2. Message Converters 설정 (UTF-8)
        // ================================
        List<HttpMessageConverter<?>> messageConverters = new ArrayList<>();
        
        // String Converter (UTF-8)
        StringHttpMessageConverter stringConverter = 
            new StringHttpMessageConverter(StandardCharsets.UTF_8);
        stringConverter.setWriteAcceptCharset(false);  // Accept-Charset 헤더 제거 (호환성)
        messageConverters.add(stringConverter);
        
        // JSON Converter (UTF-8) - 중요!
        MappingJackson2HttpMessageConverter jsonConverter = 
            new MappingJackson2HttpMessageConverter();
        jsonConverter.setDefaultCharset(StandardCharsets.UTF_8);
        
        // ObjectMapper 설정 (선택사항)
        ObjectMapper objectMapper = new ObjectMapper();
        jsonConverter.setObjectMapper(objectMapper);
        messageConverters.add(jsonConverter);
        
        // 기존 Converter들 추가
        messageConverters.addAll(restTemplate.getMessageConverters());
        
        restTemplate.setMessageConverters(messageConverters);
        
        // ================================
        // 3. 에러 핸들러 추가 (선택사항)
        // ================================
        // restTemplate.setErrorHandler(new CustomResponseErrorHandler());
        
        return restTemplate;
    }
}

