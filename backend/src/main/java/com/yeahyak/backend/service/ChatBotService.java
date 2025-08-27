package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ChatMessage;
import com.yeahyak.backend.dto.ChatbotRequest;
import com.yeahyak.backend.dto.ChatbotResponse;
import com.yeahyak.backend.entity.ChatBot;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.ChatbotType;
import com.yeahyak.backend.repository.ChatBotRepository;
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
public class ChatBotService {

  private final ChatBotRepository chatbotRepo;
  private final UserRepository userRepo;
  private final RestTemplate restTemplate;

  @Value("${ai.service.url}")
  private String aiServiceUrl;

  @Transactional
  public ChatbotResponse ask(ChatbotRequest req) {
    log.info("[ChatBotService] ask → userId={}, type={}, len(question)={}, history={}",
        req.getUserId(), req.getType(),
        (req.getQuestion() == null ? 0 : req.getQuestion().length()),
        (req.getHistory() == null ? 0 : req.getHistory().size()));

    // 0) 사용자 조회
    final User user = userRepo.findById(req.getUserId())
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    // 질문 시각
    final LocalDateTime askedAt = LocalDateTime.now();

    // 1) AI 호출
    String endpoint =
        (req.getType() == ChatbotType.QNA) ? "/chat/qna" : "/chat/faq";
    String url = aiServiceUrl + endpoint;

    Map<String, Object> payload = new HashMap<>();
    payload.put("question", req.getQuestion());

    List<Map<String, String>> historyPayload = new ArrayList<>();
    if (req.getHistory() != null) {
      for (ChatMessage m : req.getHistory()) {
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

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(payload, headers);
    log.debug("[ChatBotService] POST {} → {}", url, payload);

    ResponseEntity<ApiResponse<ChatbotResponse>> response = restTemplate.exchange(
        url,
        HttpMethod.POST,
        httpEntity,
        new ParameterizedTypeReference<ApiResponse<ChatbotResponse>>() {
        }
    );

    ApiResponse<ChatbotResponse> api = response.getBody();
    if (api == null) {
      throw new IllegalStateException("AI 서비스 응답이 비어있습니다.");
    }
    if (!api.isSuccess()) {
      throw new IllegalStateException("AI 서비스 요청에 실패했습니다.");
    }

    ChatbotResponse ai = api.getData();
    if (ai == null || ai.getAnswer() == null || ai.getAnswer().isBlank()) {
      throw new IllegalStateException("AI 응답이 올바르지 않습니다.");
    }
    log.debug("[ChatBotService] answer → len(answer)={}", ai.getAnswer().length());

    // 응답 도착 시각
    LocalDateTime answeredAt = LocalDateTime.now();

    // 2) 저장 (엔티티 스키마: user, type, question, answer)
    ChatBot chat = ChatBot.builder()
        .user(user)
        .type(req.getType())
        .question(req.getQuestion())
        .answer(ai.getAnswer())
        .build();
    chat = chatbotRepo.save(chat);
    log.debug("[ChatBotService] saved chat id={}", chat.getChatbotId());

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
