package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    private String productName;
    private String productCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MainCategory mainCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubCategory subCategory;

    private String manufacturer;
    @Lob
    private String details;
    private String unit;
    private BigDecimal unitPrice;
    private Boolean isNarcotic;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(length = 1024)
    private String productImgUrl; //약품 이미지 URL
}
