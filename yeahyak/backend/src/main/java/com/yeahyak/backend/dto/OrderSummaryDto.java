package com.yeahyak.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderSummaryDto {
    private int totalOrderCount;
    private BigDecimal totalOrderAmount;
}
