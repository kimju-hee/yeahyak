package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.InventoryTxType;
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
public class InventoryTxResponse {

  private Long inventoryTxId;
  private Long productId;
  private String productName;
  private InventoryTxType type;
  private Integer amount;
  private Integer inventoryAfter;
  private LocalDateTime createdAt;
}
