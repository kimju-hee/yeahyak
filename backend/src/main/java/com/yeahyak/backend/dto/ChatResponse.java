package com.yeahyak.backend.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatResponse {
    private Long id;
    private Long userId;
    private String question;

    @JsonProperty("reply")
    private String response;

    private ChatType chatType;
    private LocalDateTime createdAt;
}
