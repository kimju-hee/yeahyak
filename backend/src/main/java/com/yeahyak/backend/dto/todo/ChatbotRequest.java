package com.yeahyak.backend.dto.todo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yeahyak.backend.entity.enums.ChatbotType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

  @NotNull
  private ChatbotType type;

  @NotBlank
  @Size(max = 5_000)
  private String question;

  private List<ChatMessage> history;
}
