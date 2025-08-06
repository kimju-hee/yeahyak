package com.yeahyak.backend.entity;

import com.yeahyak.backend.dto.ChatType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatBot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String question;

    @Lob
    @Column(name = "response", columnDefinition = "TEXT", nullable = true)
    private String response;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatType chatType;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
