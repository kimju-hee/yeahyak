package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.TransactionType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockUpdateRequest {
    private Long productId;
    private int quantityChange;
    private TransactionType transactionType;
}