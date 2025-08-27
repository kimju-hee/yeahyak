package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.OrderStatus;
import com.yeahyak.backend.entity.enums.SubCategory;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {

  private Long orderId;
  private Long pharmacyId;
  private String pharmacyName;
  private OrderStatus status;
  private String summary;
  private BigDecimal totalPrice;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<OrderDetailResponse.Item> items;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class Item {

    private Long productId;
    private String productName;
    private MainCategory mainCategory;
    private SubCategory subCategory;
    private String manufacturer;
    private String productImgUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotalPrice;
  }
}
