package com.yeahyak.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
public class DrugStatDto {
    private Long productId;
    private String productName;
    private Long quantity;
    private BigDecimal totalPrice;

    public DrugStatDto(Long productId, String productName, Long quantity, BigDecimal totalPrice) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
    }
}
