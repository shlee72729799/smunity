package com.example.lsh_community.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // PasswordEncoder 빈은 UserServiceImpl 등에서 쓰이므로 그대로 둡니다.
    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS 설정 적용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        // 로그인, 회원가입, 이메일 인증 등은 누구나 접근 가능
                        .requestMatchers("/api/auth/**").permitAll()
                        // 게시글 목록/상세 보기도 로그인 없이 가능 (정책에 따라 변경 가능)
                        .requestMatchers("/api/posts/**").permitAll()
                        // 그 외 모든 요청은 허용 (세션 검사는 컨트롤러/서비스 레벨에서 처리하거나 필요 시 authenticated()로 변경)
                        .anyRequest().permitAll()
                )

                // 로그아웃 설정 (세션 삭제 및 쿠키 삭제)
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK); // 200 OK 반환
                        })
                        .invalidateHttpSession(true) // 서버 세션 삭제
                        .deleteCookies("JSESSIONID") // 브라우저 쿠키 삭제
                )
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // H2 콘솔 사용 시 필요

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}