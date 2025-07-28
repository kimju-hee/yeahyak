package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.BranchStatisticsDto;
import com.yeahyak.backend.repository.StatisticRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatisticService {
    private final StatisticRepositoryCustom statisticRepository;

    public BranchStatisticsDto getBranchStatistics(Long storeId, LocalDate start, LocalDate end) {
        return statisticRepository.getBranchStatistics(storeId, start, end);
    }
}
