package com.yeahyak.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockSummaryDTO {
    private String productName;
    private String category;
    private int quantity;
    private LocalDateTime lastInboundDate;
    private LocalDateTime lastOutboundDate;
    private String status;
}