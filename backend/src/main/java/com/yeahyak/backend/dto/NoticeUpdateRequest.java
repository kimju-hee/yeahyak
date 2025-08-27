package com.yeahyak.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoticeUpdateRequest {

  @Size(max = 255)
  private String title;

  @Size(max = 10_000)
  private String content;
}
