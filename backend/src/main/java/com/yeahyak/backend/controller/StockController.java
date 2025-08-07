package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/summary")
    public JinhoResponse<StockSummaryDTO> getSummary(
            @RequestParam Long pharmacyId,
            @RequestParam(required = false) MainCategory mainCategory,
            @RequestParam(required = false) SubCategory subCategory,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<StockSummaryDTO> result = stockService.getStockSummary(pharmacyId, mainCategory, subCategory, keyword, page, size);

        return JinhoResponse.<StockSummaryDTO>builder()
                .success(true)
                .data(result.getContent())
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .currentPage(result.getNumber())
                .build();
    }

    @GetMapping("/summary/page")
    public JinhoResponse<StockSummaryDTO> getSummaryPaged(
            @RequestParam Long pharmacyId,
            @RequestParam(required = false) MainCategory mainCategory,
            @RequestParam(required = false) SubCategory subCategory,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<StockSummaryDTO> result = stockService.getStockSummary(pharmacyId, mainCategory, subCategory, keyword, page, size);

        return JinhoResponse.<StockSummaryDTO>builder()
                .success(true)
                .data(result.getContent())
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .currentPage(result.getNumber())
                .build();
    }

    @GetMapping("/history")
    public JinhoResponse<StockTransactionDTO> getProductStockHistory(
            @RequestParam Long pharmacyId,
            @RequestParam Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<StockTransactionDTO> result = stockService.getProductStockHistory(pharmacyId, productId, startDate, endDate, page, size);

        return JinhoResponse.<StockTransactionDTO>builder()
                .success(true)
                .data(result.getContent())
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .currentPage(result.getNumber())
                .build();
    }

    @GetMapping("/statistics")
    public JinhoResponse<StockStatisticsDTO> getStockStatistics(
            @RequestParam Long pharmacyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        List<StockStatisticsDTO> statistics = stockService.getStockStatistics(pharmacyId, from, to);

        return JinhoResponse.<StockStatisticsDTO>builder()
                .success(true)
                .data(statistics)
                .totalPages(1)
                .totalElements(statistics.size())
                .currentPage(0)
                .build();
    }

    @PostMapping("/transaction")
    public JinhoResponse<String> handleTransaction(
            @RequestParam Long pharmacyId,
            @RequestBody StockUpdateRequest request
    ) {
        stockService.updateStock(pharmacyId, request);
        return JinhoResponse.<String>builder()
                .success(true)
                .data(List.of("재고가 성공적으로 갱신되었습니다."))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }
}
