package com.yeahyak.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DrugStatDto {
    private String drugId;
    private String drugName;
    private int quantity;
    private BigDecimal totalPrice;
}
