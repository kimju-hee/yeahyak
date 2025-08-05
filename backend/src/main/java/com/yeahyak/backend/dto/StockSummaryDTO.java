package com.yeahyak.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

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
