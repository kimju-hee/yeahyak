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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListResponse {

  private Long productId;
  private String productName;
  private String manufacturer;
  private String unit;
  private BigDecimal unitPrice;
  private String productImgUrl;
  private Integer stockQty;
  private LocalDateTime latestStockInAt;
}
