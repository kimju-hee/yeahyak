package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.ReturnStatus;
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
public class ReturnDetailResponse {

  private Long returnId;
  private Long pharmacyId;
  private String pharmacyName;
  private ReturnStatus status;
  private String summary;
  private String reason;
  private BigDecimal totalPrice;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<ReturnDetailResponse.Item> items;

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
