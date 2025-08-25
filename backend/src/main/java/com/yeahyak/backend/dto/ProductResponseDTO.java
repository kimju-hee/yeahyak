package com.yeahyak.backend.dto;
import java.time.LocalDateTime;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDTO {
    private Long productId;
    private String productName;
    private String productCode;
    private MainCategory mainCategory;
    private SubCategory subCategory;
    private String manufacturer;
    private String details;
    private String unit;
    private Integer stock;
    private BigDecimal unitPrice;
    private LocalDateTime createdAt;
    private String productImgUrl;
    private LocalDateTime lastInboundAt;   // IN or RETURN_IN의 최신 일시
    private LocalDateTime lastOutboundAt;  // OUT의 최신 일시
}