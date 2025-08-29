package com.yeahyak.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoticeUpdateRequest {

  private String title;
  private String content;
  private Boolean removeFile;
}
