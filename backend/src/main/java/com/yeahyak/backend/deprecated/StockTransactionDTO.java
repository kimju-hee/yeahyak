package com.yeahyak.backend.deprecated;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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