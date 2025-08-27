package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.ChatBot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatBotRepository extends JpaRepository<ChatBot, Long> {
  // 현재는 save(...)만 사용하므로 커스텀 메서드 없음
}