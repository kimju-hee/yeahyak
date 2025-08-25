package com.yeahyak.backend.dto.todo;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;


@Data
public class ForecastRawResultDto {

  @JsonProperty("product_name")
  private String productName;


  @JsonProperty("product_code")
  private String productCode;


  @JsonProperty("predicted_quantity")
  private int predictedQuantity;


  @JsonProperty("store_id")
  private String storeId;


  @JsonProperty("unit")
  private String unit;


  @JsonProperty("main_category")
  private String mainCategory;


  @JsonProperty("sub_category")
  private String subCategory;
}