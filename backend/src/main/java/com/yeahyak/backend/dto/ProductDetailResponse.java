package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
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
public class ProductDetailResponse {

  private Long productId;
  private String productName;
  private String insuranceCode;
  private MainCategory mainCategory;
  private SubCategory subCategory;
  private String manufacturer;
  private String unit;
  private BigDecimal unitPrice;
  private String details;
  private String productImgUrl;
  private LocalDateTime createdAt;
  private Integer inventoryQty;
}
