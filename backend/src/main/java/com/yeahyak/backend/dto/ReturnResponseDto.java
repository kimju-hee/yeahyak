package com.yeahyak.backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class ReturnResponseDto {
    private Long returnId;
    private Long pharmacyId;
    private String pharmacyName;
    private Long orderId;
    private LocalDateTime createdAt;
    private int totalPrice;
    private String status;
    private List<ReturnItemResponseDto> items;
}
