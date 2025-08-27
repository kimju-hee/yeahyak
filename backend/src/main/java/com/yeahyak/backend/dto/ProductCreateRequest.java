package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ProductCreateRequest {

  @NotBlank
  @Size(max = 100)
  private String productName;

  @NotBlank
  @Size(max = 45)
  private String insuranceCode;

  @NotNull
  private MainCategory mainCategory;

  @NotNull
  private SubCategory subCategory;

  @NotBlank
  @Size(max = 100)
  private String manufacturer;

  @NotBlank
  @Size(max = 45)
  private String unit;

  @NotNull
  @Positive
  private BigDecimal unitPrice;

  @Size(max = 10_000)
  private String details;

  private String productImgUrl;

  @NotNull
  @Positive
  private Integer stockQty;
}
