package com.yeahyak.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderSummaryDto {
    private int totalOrderCount;
    private BigDecimal totalOrderAmount;
}
