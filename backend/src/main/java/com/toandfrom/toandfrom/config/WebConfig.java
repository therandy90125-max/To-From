package com.toandfrom.toandfrom.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * ✅ CORS 설정 (Frontend <-> Backend 연결)
 * - React 개발 서버(5173, 5174 등)와의 교차 출처 요청 허용
 * - /api/**, /actuator/** 등 주요 엔드포인트에 적용
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 개발 환경: localhost의 일반적인 포트들 허용
    private static final String[] ALLOWED_ORIGINS = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5178",
        "http://127.0.0.1:5179",
        "http://127.0.0.1:5180",
        "http://localhost:3000"
    };

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        // ✅ API 요청 허용
        registry.addMapping("/api/**")
                .allowedOrigins(ALLOWED_ORIGINS)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // ✅ Actuator health check 허용
        registry.addMapping("/actuator/**")
                .allowedOrigins(ALLOWED_ORIGINS)
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // ✅ 기타 모든 요청 (fallback)
        registry.addMapping("/**")
                .allowedOrigins(ALLOWED_ORIGINS)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
