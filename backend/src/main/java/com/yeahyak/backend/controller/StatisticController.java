package com.yeahyak.backend.controller;

import com.yeahyak.backend.deprecated.BranchStatisticsDTO;
import com.yeahyak.backend.deprecated.JinhoResponse;
import com.yeahyak.backend.deprecated.StatisticService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/statistics")
public class StatisticController {

  private final StatisticService statisticService;

  @GetMapping("/branch")
  public JinhoResponse<BranchStatisticsDTO> getStatistics(
      @RequestParam Long pharmacyId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
  ) {
    BranchStatisticsDTO stats = statisticService.getBranchStatistics(pharmacyId, start, end);

    return JinhoResponse.<BranchStatisticsDTO>builder()
        .success(true)
        .data(List.of(stats))
        .totalPages(1)
        .totalElements(1)
        .currentPage(0)
        .build();
  }
}
