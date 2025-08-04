package com.yeahyak.backend.dto;

import lombok.Getter;

@Getter
public class OrderItemRequest {
    private Long productId;
    private int quantity;
    private int unitPrice;
}
