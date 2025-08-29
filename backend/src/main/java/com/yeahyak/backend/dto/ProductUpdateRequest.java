package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {

  private String productName;

  private String insuranceCode;

  private MainCategory mainCategory;

  private SubCategory subCategory;

  private String manufacturer;

  private String unit;

  @Positive
  private BigDecimal unitPrice;

  private String details;

  private String productImgUrl;
}
