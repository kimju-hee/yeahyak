package com.yeahyak.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 웹 관련 설정을 담당하는 Configuration 클래스
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 정적 리소스 핸들러 설정
     * uploads 폴더의 파일들을 /uploads/** 및 /api/uploads/** URL 패턴으로 접근할 수 있도록 설정
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/** 패턴으로 요청이 오면 file:./uploads/ 폴더에서 파일을 찾아서 서빙
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/")
                .setCachePeriod(86400); // 1일 캐시 (선택사항)
        
        // /api/uploads/** 패턴도 동일하게 처리
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:./uploads/")
                .setCachePeriod(86400); // 1일 캐시 (선택사항)
    }
}
