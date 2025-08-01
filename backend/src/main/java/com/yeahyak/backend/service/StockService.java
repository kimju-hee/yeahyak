package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface StockService {
    List<StockSummaryDTO> getStockSummary(Long pharmacyId, String category, String keyword);
    void updateStock(Long pharmacyId, StockUpdateRequest request);
    List<StockTransactionDTO> getStockTransactions(Long pharmacyId, Long productId);
    List<StockStatisticsDTO> getStockStatistics(Long pharmacyId, LocalDate from, LocalDate to);
}