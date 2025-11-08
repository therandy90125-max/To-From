package com.toandfrom.toandfrom.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 설정 - 프론트엔드와 백엔드 연동
 * 모든 컨트롤러의 @CrossOrigin을 중앙에서 관리
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // /api로 시작하는 모든 엔드포인트
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",  // React 개발 서버
                    "http://127.0.0.1:5173",
                    "http://localhost:3000"    // 추가 개발 포트 (선택사항)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);  // 1시간 캐시
        
        // Actuator health check 엔드포인트
        registry.addMapping("/actuator/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:3000"
                )
                .allowedMethods("GET", "OPTIONS", "POST")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
        
        // 모든 경로에 대한 기본 CORS 설정 (fallback)
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

