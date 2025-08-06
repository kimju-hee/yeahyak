package com.yeahyak.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.addAllowedOrigin("http://localhost:5173");
                    config.setAllowCredentials(true); // 인증 정보 허용
                    config.addAllowedHeader("*"); // 모든 헤더 허용
                    config.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
                    return config;
                }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/**").permitAll()  // 테스트 용으로 전체 허용
                        .anyRequest().permitAll()            
//                        .requestMatchers("/api/auth/**").permitAll()
//                        .requestMatchers(HttpMethod.GET, "/api/announcements/**").permitAll() // 조회 모두 허용 - 추가자 최진호
//                        .requestMatchers(HttpMethod.POST, "/api/announcements").hasRole("ADMIN")  // 등록 관리자만 - 추가자 최진호
//                        .requestMatchers(HttpMethod.DELETE, "/api/announcements/**").hasRole("ADMIN")  // 삭제 관리자만 - 추가자 최진호
//                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
//                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Forbidden\"}");
                        })
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                );

        return http.build();
    }
}
