package com.yeahyak.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockStatisticsRequest {
    private Long pharmacyId;
    private LocalDate from;
    private LocalDate to;
}