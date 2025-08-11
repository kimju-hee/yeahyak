package com.yeahyak.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HqStockDto {
    private Long stockId;
    private Long productId;
    private String productCode;
    private String productName;
    private String unit;
    private Integer quantity;
    private String lastInboundDate;   // "YYYY-MM-DD" or null
    private String lastOutboundDate;  // "YYYY-MM-DD" or null
}
