package com.yeahyak.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer unitPrice;
    private String manufacturer;
    private String mainCategory;
    private String subCategory;
    private Integer subtotalPrice;
}