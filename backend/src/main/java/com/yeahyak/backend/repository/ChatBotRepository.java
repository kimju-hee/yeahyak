package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.ChatBot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatBotRepository extends JpaRepository<ChatBot, Long> {
    List<ChatBot> findByUserId(Long userId);
}
