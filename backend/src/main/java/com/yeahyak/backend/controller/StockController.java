package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/summary")
    public ApiResponse<Page<StockSummaryDTO>> getSummary(
            @RequestParam Long pharmacyId,
            @RequestParam(required = false) MainCategory mainCategory,
            @RequestParam(required = false) SubCategory subCategory,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<StockSummaryDTO> result = stockService.getStockSummary(pharmacyId, mainCategory, subCategory, keyword, page, size);
        return new ApiResponse<>(true, result);
    }
    @GetMapping("/summary/page")
    public ApiResponse<Page<StockSummaryDTO>> getSummaryPaged(
            @RequestParam Long pharmacyId,
            @RequestParam(required = false) MainCategory mainCategory,
            @RequestParam(required = false) SubCategory subCategory,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<StockSummaryDTO> result = stockService.getStockSummary(pharmacyId, mainCategory, subCategory, keyword, page, size);
        return new ApiResponse<>(true, result);
    }
    @GetMapping("/history")
    public ApiResponse<Page<StockTransactionDTO>> getProductStockHistory(
            @RequestParam Long pharmacyId,
            @RequestParam Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<StockTransactionDTO> result = stockService.getProductStockHistory(pharmacyId, productId, startDate, endDate, page, size);
        return new ApiResponse<>(true, result);
    }
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<List<StockStatisticsDTO>>> getStockStatistics(
            @RequestParam Long pharmacyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        List<StockStatisticsDTO> statistics = stockService.getStockStatistics(pharmacyId, from, to);
        return ResponseEntity.ok(new ApiResponse<>(true, statistics));
    }

    @PostMapping("/transaction")
    public ApiResponse<?> handleTransaction(
            @RequestParam Long pharmacyId,
            @RequestBody StockUpdateRequest request
    ) {
        stockService.updateStock(pharmacyId, request);
        return new ApiResponse<>(true, "재고가 성공적으로 갱신되었습니다.");
    }
}
