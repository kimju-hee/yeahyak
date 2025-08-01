package com.yeahyak.backend.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchStatisticsDto {
    private Long storeId;
    private String storeName;
    private Period period;
    private OrderSummaryDto orderSummary;
    private List<DrugStatDto> orderedDrugs;

    @Getter @Setter @Builder
    @AllArgsConstructor @NoArgsConstructor
    public static class Period {
        private LocalDate start;
        private LocalDate end;
    }
}