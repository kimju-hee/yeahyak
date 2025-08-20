package com.yeahyak.backend.config;

import com.yeahyak.backend.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // $2a / $2y 해시만 처리
        BCryptPasswordEncoder enc2a = new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2A);
        BCryptPasswordEncoder enc2y = new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2Y);

        return new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                // 새로 저장할 때는 $2y로 인코딩
                return enc2y.encode(rawPassword);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                if (encodedPassword == null) return false;

                // 만약 {bcrypt}$2x$ 형태로 저장된 게 있으면 접두어 제거
                String enc = encodedPassword.startsWith("{bcrypt}")
                        ? encodedPassword.substring("{bcrypt}".length())
                        : encodedPassword;

                if (enc.startsWith("$2y$")) return enc2y.matches(rawPassword, enc);
                if (enc.startsWith("$2a$")) return enc2a.matches(rawPassword, enc);

                // 그 외 prefix는 지원하지 않음
                return false;
            }

            @Override
            public boolean upgradeEncoding(String encodedPassword) {
                // $2y가 아니면 업그레이드 대상
                return encodedPassword != null
                        && !encodedPassword.startsWith("$2y$")
                        && !encodedPassword.startsWith("{bcrypt}$2y$");
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(
                "/static/**",
                "/favicon.ico"
        );
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://4.230.25.25"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authEx) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"error\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((req, res, accEx) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"error\":\"Forbidden\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/auth/**",
                                "/actuator/**",
                                "/health",
                                "/error",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/docs/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
