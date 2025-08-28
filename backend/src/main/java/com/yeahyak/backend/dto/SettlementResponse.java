package com.yeahyak.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SettlementResponse {

  private Long balanceTxId;
  private Long pharmacyId;
  private BigDecimal amount;
  private BigDecimal balanceBefore;
  private BigDecimal balanceAfter;
  private LocalDateTime createdAt;
}
