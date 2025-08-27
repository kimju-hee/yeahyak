// src/main/java/com/yeahyak/backend/controller/ChatController.java
package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ChatRequest;
import com.yeahyak.backend.dto.ChatResponse;
import com.yeahyak.backend.dto.ChatType;
import com.yeahyak.backend.service.ChatBotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatBotService chatService;

    @PostMapping("/qna")
    public ResponseEntity<ApiResponse<ChatResponse>> askQna(@RequestBody ChatRequest req) {
        req.setChatType(ChatType.QNA);
        ChatResponse resp = chatService.askQuestion(req);

        ApiResponse<ChatResponse> wrapped =
                ApiResponse.<ChatResponse>builder()
                        .success(true)
                        .data(resp)
                        .error(null)
                        .build();

        return ResponseEntity.ok(wrapped);
    }

    @PostMapping("/faq")
    public ResponseEntity<ApiResponse<ChatResponse>> askFaq(@RequestBody ChatRequest req) {
        req.setChatType(ChatType.FAQ);
        ChatResponse resp = chatService.askQuestion(req);

        ApiResponse<ChatResponse> wrapped =
                ApiResponse.<ChatResponse>builder()
                        .success(true)
                        .data(resp)
                        .error(null)
                        .build();

        return ResponseEntity.ok(wrapped);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> history(@PathVariable Long userId) {
        List<ChatResponse> list = chatService.getHistory(userId);

        ApiResponse<List<ChatResponse>> wrapped =
                ApiResponse.<List<ChatResponse>>builder()
                        .success(true)
                        .data(list)
                        .error(null)
                        .build();

        return ResponseEntity.ok(wrapped);
    }
}
