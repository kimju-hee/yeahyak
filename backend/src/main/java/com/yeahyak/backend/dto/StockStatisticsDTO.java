package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.TransactionType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@ToString
public class StockStatisticsDTO {

    private String date; // 수정됨: LocalDate -> String
    private TransactionType transactionType;
    private Long totalQuantity;

    public StockStatisticsDTO(String date, TransactionType transactionType, Long totalQuantity) {
        this.date = date;
        this.transactionType = transactionType;
        this.totalQuantity = totalQuantity;
    }
}
