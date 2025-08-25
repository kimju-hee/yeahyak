package com.yeahyak.backend.deprecated;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockSummaryDTO {

  private String productName;
  private String mainCategory;
  private String subCategory;
  private Integer quantity;
  private LocalDateTime lastInboundDate;
  private LocalDateTime lastOutboundDate;
  private String status;
}
