package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.todo.ChatbotRequest;
import com.yeahyak.backend.dto.todo.ChatbotResponse;

public interface AiClient {

  ChatbotResponse askQuestion(ChatbotRequest request);
}