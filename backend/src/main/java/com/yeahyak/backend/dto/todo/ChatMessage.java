package com.yeahyak.backend.dto.todo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yeahyak.backend.entity.enums.ChatRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatMessage {

  private ChatRole role;
  private String content;
}
