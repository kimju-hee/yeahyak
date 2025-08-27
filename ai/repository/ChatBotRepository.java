package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.ChatBot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatBotRepository extends JpaRepository<ChatBot, Long> {
    List<ChatBot> findByUserId(Long userId);
}