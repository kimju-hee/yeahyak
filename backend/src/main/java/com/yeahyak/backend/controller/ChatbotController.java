// src/main/java/com/yeahyak/backend/controller/ChatbotController.java
package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ChatbotRequest;
import com.yeahyak.backend.dto.ChatbotResponse;
import com.yeahyak.backend.entity.enums.ChatbotType;
import com.yeahyak.backend.service.ChatbotService;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/chatbot", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
public class ChatbotController {

  private final ChatbotService chatbotService;

  @PreAuthorize("isAuthenticated()")
  @PostMapping(path = "/qna", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<ApiResponse<ChatbotResponse>> askQna(
      @RequestBody @Valid ChatbotRequest req
  ) {
    req.setType(ChatbotType.QNA);
    ChatbotResponse res = chatbotService.ask(req);
    URI location = URI.create("/api/chatbot/" + res.getChatbotId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }

  @PreAuthorize("isAuthenticated()")
  @PostMapping(path = "/faq", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<ApiResponse<ChatbotResponse>> askFaq(
      @RequestBody @Valid ChatbotRequest req
  ) {
    req.setType(ChatbotType.FAQ);
    ChatbotResponse res = chatbotService.ask(req);
    URI location = URI.create("/api/chatbot/" + res.getChatbotId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }
}
