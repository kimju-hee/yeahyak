package com.yeahyak.backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReturnItemResponseDto {
    private Long productId;
    private String productName;
    private String manufacturer;
    private String reason;
    private int quantity;
    private int unitPrice;
    private int subtotalPrice;
}
