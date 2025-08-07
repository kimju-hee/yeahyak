package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private BigDecimal unitPrice;
    private Boolean isNarcotic;
    private LocalDateTime createdAt;
    private String productImgUrl;
}
