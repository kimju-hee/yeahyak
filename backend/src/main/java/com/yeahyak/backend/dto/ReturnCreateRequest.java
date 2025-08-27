package com.yeahyak.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReturnCreateRequest {

  @NotNull
  private Long pharmacyId;

  @NotNull
  private Long orderId;

  @NotBlank
  @Size(max = 255)
  private String reason;

  @NotEmpty
  @Valid
  private List<ReturnCreateRequest.Item> items;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Item {

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private Integer quantity;

    @NotNull
    @Positive
    private BigDecimal unitPrice;

    @NotNull
    @Positive
    private BigDecimal subtotalPrice;
  }
}
