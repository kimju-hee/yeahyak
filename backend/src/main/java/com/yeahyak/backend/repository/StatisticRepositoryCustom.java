package com.yeahyak.backend.repository;

import com.yeahyak.backend.dto.BranchStatisticsDto;

import java.time.LocalDate;

public interface StatisticRepositoryCustom {
    BranchStatisticsDto getBranchStatistics(Long storeId, LocalDate start, LocalDate end);
}
