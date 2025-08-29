package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.ChatType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Chatbot Entity representing a chatbot interaction.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "chatbot")
public class Chatbot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "chatbot_id")
  private Long chatbotId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 45)
  private ChatType type;

  @Lob
  @Column(nullable = false, columnDefinition = "TEXT")
  private String question;

  @Lob
  @Column(columnDefinition = "TEXT")
  private String answer;

  // 질문 시각 직접 저장
  @Column(name = "asked_at", nullable = false)
  private LocalDateTime askedAt;

  // 답변 시각 직접 저장
  @Column(name = "answered_at")
  private LocalDateTime answeredAt;
}
