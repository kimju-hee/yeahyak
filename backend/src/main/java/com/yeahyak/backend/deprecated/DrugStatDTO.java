package com.yeahyak.backend.deprecated;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
public class DrugStatDTO {

  private Long productId;
  private String productName;
  private Long quantity;
  private BigDecimal totalPrice;

  public DrugStatDTO(Long productId, String productName, Long quantity, BigDecimal totalPrice) {
    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
  }
}
