package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/summary")
    public ApiResponse<List<StockSummaryDTO>> getSummary(@RequestParam Long pharmacyId,
                                            @RequestParam(required = false) String category,
                                            @RequestParam(required = false) String keyword) {
        return new ApiResponse<>(true, stockService.getStockSummary(pharmacyId, category, keyword));
    }

    @PostMapping("/update")
    public ApiResponse<String> updateStock(@RequestParam Long pharmacyId,
                            @RequestBody StockUpdateRequest request) {
        stockService.updateStock(pharmacyId, request);
        return new ApiResponse<>(true, "수정되었습니다.");
    }

    @GetMapping("/transactions")
    public ApiResponse<List<StockTransactionDTO>> getTransactions(@RequestParam Long pharmacyId,
                                                     @RequestParam(required = false) Long productId) {
        return new ApiResponse<>(true, stockService.getStockTransactions(pharmacyId, productId));
    }

    @PostMapping("/statistics")
    public ApiResponse<List<StockStatisticsDTO>> getStatistics(@RequestBody StockStatisticsRequest request) {
        return new ApiResponse<>(true, stockService.getStockStatistics(request.getPharmacyId(), request.getFrom(), request.getTo()));
    }
}
