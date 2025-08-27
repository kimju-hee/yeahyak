package com.yeahyak.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForecastRawResult {

  @JsonProperty("product_name")
  private String productName;

  @JsonProperty("insurance_code")
  private String insuranceCode;

  @JsonProperty("main_category")
  private String mainCategory;

  @JsonProperty("sub_category")
  private String subCategory;

  @JsonProperty("unit")
  private String unit;

  @JsonProperty("pharmacy_id")
  private String pharmacyId;

  @JsonProperty("predicted_quantity")
  private Integer predictedQuantity;
}
