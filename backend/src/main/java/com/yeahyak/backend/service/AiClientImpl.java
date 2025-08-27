// src/main/java/com/yeahyak/backend/service/impl/AiClientImpl.java
package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ChatRequest;
import com.yeahyak.backend.dto.ChatResponse;
import com.yeahyak.backend.dto.ChatType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiClientImpl implements AiClient {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    @Override
    public ChatResponse askQuestion(ChatRequest req) {
        boolean isQna = req.getChatType() == ChatType.QNA;
        String endpoint = isQna ? "/chat/qna" : "/chat/faq";
        String url = aiServiceUrl + endpoint;

        Map<String, Object> payload = new HashMap<>();
        if (isQna) {
            payload.put("query",   req.getQuestion());
            payload.put("history", req.getHistory() != null ? req.getHistory() : List.of());
        } else {
            payload.put("question", req.getQuestion());
        }

        log.debug("[AiClient] POST {} → {}", url, payload);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        // ApiResponse<ChatResponse> 로 받기
        ResponseEntity<ApiResponse<ChatResponse>> respEntity =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        requestEntity,
                        new ParameterizedTypeReference<>() {}
                );

        ApiResponse<ChatResponse> apiResp = respEntity.getBody();
        if (apiResp == null) {
            throw new RuntimeException("AI 서비스 응답이 비어있습니다.");
        }
        if (!apiResp.isSuccess()) {
            throw new RuntimeException("AI 서비스 오류: " + apiResp.getError());
        }

        ChatResponse chatResp = apiResp.getData();
        log.debug("[AiClient] AI 응답 → reply={}", chatResp.getResponse());
        return chatResp;
    }
}
