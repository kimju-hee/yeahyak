package com.yeahyak.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {
    private Long orderId;
    private Long pharmacyId;
    private String pharmacyName;
    private LocalDateTime createdAt;
    private Integer totalPrice;
    private String status;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
}
