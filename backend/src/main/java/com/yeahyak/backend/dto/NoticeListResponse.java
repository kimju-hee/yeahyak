package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.NoticeType;
import java.time.LocalDateTime;
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
public class NoticeListResponse {

  private Long noticeId;
  private NoticeType type;
  private String title;
  private LocalDateTime createdAt;
}
