package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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

  @Size(max = 100)
  private String productName;

  @Size(max = 45)
  private String insuranceCode;

  private MainCategory mainCategory;

  private SubCategory subCategory;

  @Size(max = 100)
  private String manufacturer;

  @Size(max = 45)
  private String unit;

  @Positive
  private BigDecimal unitPrice;

  @Size(max = 10_000)
  private String details;

  private String productImgUrl;
}
