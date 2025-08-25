package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.todo.ChatbotRequest;
import com.yeahyak.backend.dto.todo.ChatbotResponse;
import java.util.List;

public interface ChatBotService {

  ChatbotResponse askQuestion(ChatbotRequest request);

  List<ChatbotResponse> getHistory(Long userId);
}
