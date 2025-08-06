package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ChatRequest;
import com.yeahyak.backend.dto.ChatResponse;

import java.util.List;

public interface ChatBotService {
    ChatResponse askQuestion(ChatRequest request);
    List<ChatResponse> getHistory(Long userId);
}
