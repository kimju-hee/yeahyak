package com.yeahyak.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yeahyak.backend.entity.enums.ChatType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
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
public class ChatbotRequest {

  @NotNull
  private Long userId;

  private ChatType type;

  @NotBlank
  private String question;

  private List<ChatMessage> history;
}
