package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ChatRequest;
import com.yeahyak.backend.dto.ChatResponse;

public interface AiClient {
    ChatResponse askQuestion(ChatRequest request);
}