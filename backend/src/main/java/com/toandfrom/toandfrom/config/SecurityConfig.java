package com.toandfrom.toandfrom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

/**
 * ✅ Spring Security 설정
 * - CORS 설정을 Security 레벨에서 관리 (WebConfig보다 우선순위 높음)
 * - 모든 API 요청 허용 (인증 비활성화)
 * - CSRF 비활성화 (REST API이므로 불필요)
 */
@Configuration
public class SecurityConfig {

    /**
     * Security Filter Chain 설정
     * - 모든 요청 허용 (permitAll)
     * - CORS 활성화
     * - CSRF 비활성화
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**", "/actuator/**", "/h2-console/**").permitAll()
                .anyRequest().permitAll()
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // H2 Console을 위한 설정
        return http.build();
    }

    /**
     * CORS Configuration Source
     * - React 개발 서버(5173, 5174 등)와의 교차 출처 요청 허용
     * - 모든 HTTP 메서드 허용
     * - Credentials 허용
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration conf = new CorsConfiguration();
        
        // 허용할 Origin 목록 (개발 환경: localhost의 모든 포트 허용)
        conf.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));
        
        // 또는 특정 포트만 허용하려면:
        // conf.setAllowedOrigins(List.of(
        //     "http://localhost:5173",
        //     "http://localhost:5174",
        //     "http://localhost:5178",
        //     "http://127.0.0.1:5173",
        //     "http://127.0.0.1:5174",
        //     "http://127.0.0.1:5178",
        //     "http://localhost:3000"
        // ));
        
        // 허용할 HTTP 메서드
        conf.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // 허용할 헤더 (모든 헤더)
        conf.addAllowedHeader("*");
        
        // Credentials 허용 (쿠키, 인증 헤더 등)
        conf.setAllowCredentials(true);
        
        // Preflight 요청 캐시 시간 (1시간)
        conf.setMaxAge(3600L);

        // 모든 경로에 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", conf);

        return source;
    }
}

