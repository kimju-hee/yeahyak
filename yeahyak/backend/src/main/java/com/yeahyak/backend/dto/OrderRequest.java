package com.yeahyak.backend.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class OrderRequest {
    private Long pharmacyId;
    private List<OrderItemRequest> items;
}
