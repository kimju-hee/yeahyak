package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.entity.PharmacyStock;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface StockService {
    List<StockSummaryDTO> getStockSummary(Long pharmacyId, MainCategory mainCategory, SubCategory subCategory, String keyword);
    void updateStock(Long pharmacyId, StockUpdateRequest request);
    List<StockTransactionDTO> getStockTransactions(Long pharmacyId, Long productId);
    List<StockStatisticsDTO> getStockStatistics(Long pharmacyId, LocalDate from, LocalDate to);
    Page<StockSummaryDTO> getStockSummary(Long pharmacyId, MainCategory mainCategory, SubCategory subCategory, String keyword, int page, int size);
    Page<StockTransactionDTO> getProductStockHistory(Long pharmacyId, Long productId, LocalDate startDate, LocalDate endDate, int page, int size);
}