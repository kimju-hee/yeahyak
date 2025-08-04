package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.TransactionType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionDTO {
    private String productName;
    private TransactionType transactionType;
    private int quantity;
    private LocalDateTime transactionDate;
}