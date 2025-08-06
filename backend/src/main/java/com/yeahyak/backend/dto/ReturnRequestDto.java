package com.yeahyak.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ReturnRequestDto {
    private Long pharmacyId;
    private Long orderId;
    private String reason;
    private List<ReturnItemDto> items;

    @Getter
    @Setter
    public static class ReturnItemDto {
        private Long productId;
        private int quantity;
        private int unitPrice;
    }
}
