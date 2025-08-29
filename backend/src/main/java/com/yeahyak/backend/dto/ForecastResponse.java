package com.yeahyak.backend.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForecastResponse {

  private Long productId;
  private String productName;
  private String insuranceCode;
  private String manufacturer;
  private String productImgUrl;
  private Integer quantity;
  private BigDecimal unitPrice;
  private BigDecimal subtotalPrice;
}
