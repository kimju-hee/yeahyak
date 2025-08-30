package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ChatMessage;
import com.yeahyak.backend.dto.ChatbotRequest;
import com.yeahyak.backend.dto.ChatbotResponse;
import com.yeahyak.backend.entity.Chatbot;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.ChatType;
import com.yeahyak.backend.repository.ChatbotRepository;
import com.yeahyak.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

  private final ChatbotRepository chatbotRepository;
  private final UserRepository userRepository;
  private final RestTemplate restTemplate;

  @Value("${ai.service.url}")
  private String aiServiceUrl;

  @Transactional
  public ChatbotResponse ask(ChatbotRequest req) {
    log.info("[ChatbotService] ask → userId={}, type={}, len(question)={}, size(history)={}",
        req.getUserId(), req.getType(),
        (req.getQuestion() == null ? 0 : req.getQuestion().length()),
        (req.getHistory() == null ? 0 : req.getHistory().size()));

    // 0) 사용자 조회
    final User user = userRepository.findById(req.getUserId())
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    // 질문 시각
    final LocalDateTime askedAt = LocalDateTime.now();

    // 1) AI 호출
    Map<String, Object> payload = new HashMap<>();
    payload.put("question", req.getQuestion());

    List<Map<String, String>> historyPayload = new ArrayList<>();
    if (req.getHistory() != null) {
      for (ChatMessage m : req.getHistory()) {
        // AI 서버가 기대하는 "type" 키 사용 (gateway.py의 "type" 키와 일치)
        String type = (m.getRole() != null && m.getRole().name().equalsIgnoreCase("USER"))
            ? "user"
            : "ai";
        Map<String, String> item = new HashMap<>();
        item.put("type", type);
        item.put("content", m.getContent());
        historyPayload.add(item);
      }
    }
    payload.put("history", historyPayload);

    String endpoint =
        (req.getType() == ChatType.QNA) ? "/chat/qna" : "/chat/faq";
    String url = aiServiceUrl + endpoint;

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(payload, headers);
    log.debug("[ChatbotService] POST {} → {}", url, payload);

    // AI 서버 응답을 Map 파싱 (실제 응답 구조: { success: true, data: { answer: "...", history: [...] } })
    ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
        url,
        HttpMethod.POST,
        httpEntity,
        new ParameterizedTypeReference<Map<String, Object>>() {
        }
    );

    Map<String, Object> responseBody = response.getBody();
    if (responseBody == null) {
      throw new RuntimeException("AI 서비스 응답이 비어있습니다.");
    }

    Boolean success = (Boolean) responseBody.get("success");
    if (success == null || !success) {
      String error = (String) responseBody.get("error");
      throw new RuntimeException("AI 서비스 요청에 실패했습니다: " + (error != null ? error : "Unknown error"));
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
    if (data == null) {
      throw new RuntimeException("AI 응답 데이터가 없습니다.");
    }

    String answer = (String) data.get("answer");
    if (answer == null || answer.isBlank()) {
      throw new RuntimeException("AI 응답이 올바르지 않습니다.");
    }
    log.debug("[ChatbotService] answer → len(answer)={}", answer.length());

    // 응답 도착 시각
    LocalDateTime answeredAt = LocalDateTime.now();

    // 2) 저장 (엔티티 스키마: user, type, question, answer)
    Chatbot chat = Chatbot.builder()
        .user(user)
        .type(req.getType())
        .question(req.getQuestion())
        .answer(answer)
        .askedAt(askedAt)
        .answeredAt(answeredAt)
        .build();
    chatbotRepository.save(chat);

    // 3) DTO 반환 (저장값 기준으로 보장)
    return ChatbotResponse.builder()
        .chatbotId(chat.getChatbotId())
        .userId(user.getUserId())
        .type(chat.getType())
        .question(chat.getQuestion())
        .answer(chat.getAnswer())
        .askedAt(chat.getAskedAt())
        .answeredAt(chat.getAnsweredAt())
        .build();
  }
}
