package com.yeahyak.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HqStockTxDto {
    private Long id;
    private String date;     // "YYYY-MM-DD"
    private String type;     // "입고" | "출고" | "반품입고"
    private Integer quantity;
    private Integer balance; // 역산된 잔액
    private String remark;   // 약국명 등
}
