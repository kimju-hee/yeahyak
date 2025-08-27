package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.BranchStatisticsDto;
import com.yeahyak.backend.dto.JinhoResponse;
import com.yeahyak.backend.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/statistics")
public class StatisticController {

    private final StatisticService statisticService;

    @GetMapping("/branch")
    public JinhoResponse<BranchStatisticsDto> getStatistics(
            @RequestParam Long pharmacyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        BranchStatisticsDto stats = statisticService.getBranchStatistics(pharmacyId, start, end);

        return JinhoResponse.<BranchStatisticsDto>builder()
                .success(true)
                .data(List.of(stats))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }
}
