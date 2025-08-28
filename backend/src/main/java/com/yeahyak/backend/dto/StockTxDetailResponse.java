package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.StockTxType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTxDetailResponse {

  private Long stockTxId;
  private Long productId;
  private StockTxType type;
  private Integer amount;
  private Integer quantityAfter;
  private LocalDateTime createdAt;
}
