package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.BranchStatisticsDto;
import com.yeahyak.backend.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/statistics")
public class StatisticController {

    private final StatisticService statisticService;

    @GetMapping("/branch")
    public ResponseEntity<BranchStatisticsDto> getStatistics(
            @RequestParam Long pharmacyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        BranchStatisticsDto stats = statisticService.getBranchStatistics(pharmacyId, start, end);
        return ResponseEntity.ok(stats);
    }
}
