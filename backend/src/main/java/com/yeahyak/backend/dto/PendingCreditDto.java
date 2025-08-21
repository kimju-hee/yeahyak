package com.yeahyak.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PendingCreditDto {
    private Long userId;
    private String email;
    private Long pharmacyId;
    private String pharmacyName;
    private Integer point;
    private String recentSettledDate;
    private Integer recentSettledAmount;
    private Integer totalSettledAmount;
    private String creditStatus;
}
