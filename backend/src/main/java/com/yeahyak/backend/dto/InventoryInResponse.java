package com.yeahyak.backend.dto;

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
public class InventoryInResponse {

  private Long inventoryTxId;
  private Long productId;
  private Integer amount;
  private Integer inventoryBefore;
  private Integer inventoryAfter;
  private LocalDateTime createdAt;
}
