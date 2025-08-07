package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
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
    private MainCategory mainCategory;
    private SubCategory subCategory;
    private String manufacturer;
    private String unit;
    private BigDecimal unitPrice;
    private String pdfPath;
    private String details;
    private String productImgUrl;
}

