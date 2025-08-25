// src/main/java/com/yeahyak/backend/controller/ChatController.java
package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.todo.ChatbotRequest;
import com.yeahyak.backend.dto.todo.ChatbotResponse;
import com.yeahyak.backend.service.ChatBotService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

  private final ChatBotService chatService;

  @PostMapping("/qna")
  public ResponseEntity<ApiResponse<ChatbotResponse>> askQna(@RequestBody ChatbotRequest req) {
    req.setChatType(ChatType.QNA);
    ChatbotResponse resp = chatService.askQuestion(req);

    ApiResponse<ChatbotResponse> wrapped =
        ApiResponse.<ChatbotResponse>builder()
            .success(true)
            .data(resp)
            .error(null)
            .build();

    return ResponseEntity.ok(wrapped);
  }

  @PostMapping("/faq")
  public ResponseEntity<ApiResponse<ChatbotResponse>> askFaq(@RequestBody ChatbotRequest req) {
    req.setChatType(ChatType.FAQ);
    ChatbotResponse resp = chatService.askQuestion(req);

    ApiResponse<ChatbotResponse> wrapped =
        ApiResponse.<ChatbotResponse>builder()
            .success(true)
            .data(resp)
            .error(null)
            .build();

    return ResponseEntity.ok(wrapped);
  }

  @GetMapping("/history/{userId}")
  public ResponseEntity<ApiResponse<List<ChatbotResponse>>> history(@PathVariable Long userId) {
    List<ChatbotResponse> list = chatService.getHistory(userId);

    ApiResponse<List<ChatbotResponse>> wrapped =
        ApiResponse.<List<ChatbotResponse>>builder()
            .success(true)
            .data(list)
            .error(null)
            .build();

    return ResponseEntity.ok(wrapped);
  }
}
