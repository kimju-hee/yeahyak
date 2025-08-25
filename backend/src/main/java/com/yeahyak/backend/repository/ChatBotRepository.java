package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.ChatBot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotRepository extends JpaRepository<ChatBot, Long> {

}
