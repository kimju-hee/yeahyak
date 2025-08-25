package com.yeahyak.backend.deprecated;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderSummaryDTO {

  private int totalOrderCount;
  private BigDecimal totalOrderAmount;
}
