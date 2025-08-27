package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public class OrderListResponse {

  private Long orderId;
  private Long pharmacyId;
  private String pharmacyName;
  private OrderStatus status;
  private String summary;
  private BigDecimal totalPrice;
  private LocalDateTime createdAt;
}
