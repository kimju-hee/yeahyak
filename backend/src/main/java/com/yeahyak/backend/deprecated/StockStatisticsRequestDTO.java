package com.yeahyak.backend.deprecated;

import java.time.LocalDate;
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
public class StockStatisticsRequestDTO {

  private Long pharmacyId;
  private LocalDate from;
  private LocalDate to;
}