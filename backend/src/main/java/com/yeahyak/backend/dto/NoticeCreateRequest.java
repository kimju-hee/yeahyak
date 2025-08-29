package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.NoticeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoticeCreateRequest {

  @NotNull
  private NoticeType type;

  @NotBlank
  private String title;

  @NotBlank
  private String content;
}
