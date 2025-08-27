package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ChatRequest;
import com.yeahyak.backend.dto.ChatResponse;
import com.yeahyak.backend.entity.ChatBot;
import com.yeahyak.backend.repository.ChatBotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatBotServiceImpl implements ChatBotService {

    private final ChatBotRepository repo;
    private final AiClient aiClient;

    @Override
    @Transactional
    public ChatResponse askQuestion(ChatRequest req) {
        log.info("[ChatBotService] askQuestion called → userId={}, question='{}', chatType={}",
                req.getUserId(), req.getQuestion(), req.getChatType());

        // 1) AI 호출
        ChatResponse aiResponse = aiClient.askQuestion(req);
        log.debug("[ChatBotService] Received AI response → {}", aiResponse.getResponse());

        // 2) 질문 + 응답을 한 번에 저장 (response NOT NULL 제약 해결)
        ChatBot chat = ChatBot.builder()
                .userId(req.getUserId())
                .question(req.getQuestion())
                .response(aiResponse.getResponse())
                .chatType(req.getChatType())
                .build();
        chat = repo.save(chat);
        log.debug("[ChatBotService] Saved chat to DB, id={}", chat.getId());

        // 3) 최종 결과 DTO 반환
        return ChatResponse.builder()
                .id(chat.getId())
                .userId(chat.getUserId())
                .question(chat.getQuestion())
                .response(chat.getResponse())
                .chatType(chat.getChatType())
                .createdAt(chat.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatResponse> getHistory(Long userId) {
        log.info("[ChatBotService] getHistory called → userId={}", userId);
        return repo.findByUserId(userId).stream()
                .map(chat -> ChatResponse.builder()
                        .id(chat.getId())
                        .userId(chat.getUserId())
                        .question(chat.getQuestion())
                        .response(chat.getResponse())
                        .chatType(chat.getChatType())
                        .createdAt(chat.getCreatedAt())
                        .build()
                )
                .collect(Collectors.toList());
    }
}
