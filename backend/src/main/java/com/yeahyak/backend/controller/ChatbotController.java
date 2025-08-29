package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ChatbotRequest;
import com.yeahyak.backend.dto.ChatbotResponse;
import com.yeahyak.backend.entity.enums.ChatType;
import com.yeahyak.backend.service.ChatbotService;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 챗봇 관련 API 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

  private final ChatbotService chatbotService;

  /**
   * Q&A 챗봇에 질문을 하고 응답을 받습니다.
   */
  @PostMapping("/qna")
  public ResponseEntity<ApiResponse<ChatbotResponse>> askQna(
      @RequestBody @Valid ChatbotRequest req
  ) {
    req.setType(ChatType.QNA);
    ChatbotResponse res = chatbotService.ask(req);
    URI location = URI.create("/api/chatbot/" + res.getChatbotId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * FAQ 챗봇에 질문을 하고 응답을 받습니다.
   */
  @PostMapping("/faq")
  public ResponseEntity<ApiResponse<ChatbotResponse>> askFaq(
      @RequestBody @Valid ChatbotRequest req
  ) {
    req.setType(ChatType.FAQ);
    ChatbotResponse res = chatbotService.ask(req);
    URI location = URI.create("/api/chatbot/" + res.getChatbotId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }
}
