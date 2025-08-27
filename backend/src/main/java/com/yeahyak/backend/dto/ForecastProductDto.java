package com.yeahyak.backend.dto;


import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;


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