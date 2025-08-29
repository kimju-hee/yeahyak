package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ProductCreateRequest {

  @NotBlank
  private String productName;

  @NotBlank
  private String insuranceCode;

  @NotNull
  private MainCategory mainCategory;

  @NotNull
  private SubCategory subCategory;

  @NotBlank
  private String manufacturer;

  @NotBlank
  private String unit;

  @NotNull
  @Positive
  private BigDecimal unitPrice;

  private String details;

  private String productImgUrl;

  @NotNull
  @Positive
  private Integer inventoryQty;
}
