package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.ReturnStatus;
import java.math.BigDecimal;
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
public class ReturnListResponse {

  private Long returnId;
  private Long pharmacyId;
  private String pharmacyName;
  private ReturnStatus status;
  private String summary;
  private String reason;
  private BigDecimal totalPrice;
  private LocalDateTime createdAt;
}
