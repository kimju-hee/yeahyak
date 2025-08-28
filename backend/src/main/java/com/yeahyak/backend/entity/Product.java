package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "products")
public class Product {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "product_id")
  private Long productId;

  @Column(name = "product_name", nullable = false, length = 100)
  private String productName;

  @Column(name = "insurance_code", nullable = false, unique = true, length = 45)
  private String insuranceCode;

  @Enumerated(EnumType.STRING)
  @Column(name = "main_category", nullable = false)
  private MainCategory mainCategory;

  @Enumerated(EnumType.STRING)
  @Column(name = "sub_category", nullable = false)
  private SubCategory subCategory;

  @Column(nullable = false, length = 100)
  private String manufacturer;

  @Column(nullable = false, length = 45)
  private String unit;

  @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
  private BigDecimal unitPrice;

  @Lob
  @Column(columnDefinition = "TEXT")
  private String details;

  @Lob
  @Column(name = "product_img_url", columnDefinition = "LONGTEXT")
  private String productImgUrl;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "stock_qty", nullable = false)
  private Integer stockQty;
}
