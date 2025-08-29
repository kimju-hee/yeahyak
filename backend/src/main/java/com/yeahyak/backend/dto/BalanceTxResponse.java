package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.BalanceTxType;
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
public class BalanceTxResponse {

  private Long balanceTxId;
  private Long pharmacyId;
  private String pharmacyName;
  private BalanceTxType type;
  private BigDecimal amount;
  private BigDecimal balanceAfter;
  private LocalDateTime createdAt;
}
