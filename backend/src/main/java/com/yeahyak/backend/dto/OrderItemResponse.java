package com.yeahyak.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderItemResponse {
    private String productName;
    private Integer quantity;
    private Integer unitPrice;
    private Integer subtotalPrice;
}