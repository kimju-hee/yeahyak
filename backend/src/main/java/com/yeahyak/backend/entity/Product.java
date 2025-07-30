package com.yeahyak.backend.entity;

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
    private String category;
    private String manufacturer;
    @Lob
    private String details;
    private String unit;
    private BigDecimal unitPrice;
    private Boolean isNarcotic;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
