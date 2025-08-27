package com.yeahyak.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yeahyak.backend.entity.enums.ChatBotType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatbotResponse {

  private Long chatbotId;
  private Long userId;
  private ChatBotType type;
  private String question;
  private String answer;
  private LocalDateTime askedAt;
  private LocalDateTime answeredAt;
}
