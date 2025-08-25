package com.yeahyak.backend.dto.todo;


import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ForecastProductDto {

  private Long productId;
  private String productName;
  private String productCode;
  private String manufacturer;
  private BigDecimal unitPrice;
  private Integer quantity;
  private BigDecimal subtotalPrice;
  private String productImgUrl;
}