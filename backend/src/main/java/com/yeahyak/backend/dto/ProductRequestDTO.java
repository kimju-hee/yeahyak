package com.yeahyak.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDTO {
    private String productName;
    private String productCode;
    private String category;
    private String manufacturer;
    private String unit;
    private BigDecimal unitPrice;
    private Boolean isNarcotic;
    private String pdfPath;
}

