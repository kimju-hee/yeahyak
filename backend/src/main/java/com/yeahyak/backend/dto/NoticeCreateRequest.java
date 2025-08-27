package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.NoticeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
  @Size(max = 255)
  private String title;

  @NotBlank
  @Size(max = 10_000)
  private String content;
}
