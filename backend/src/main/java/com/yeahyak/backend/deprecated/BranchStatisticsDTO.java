package com.yeahyak.backend.deprecated;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchStatisticsDTO {

  private Long storeId;
  private String storeName;
  private Period period;
  private OrderSummaryDTO orderSummary;
  private List<DrugStatDTO> orderedDrugs;

  @Getter
  @Setter
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class Period {

    private LocalDate start;
    private LocalDate end;
  }
}