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
    public List<StockSummaryDTO> getSummary(@RequestParam Long pharmacyId,
                                            @RequestParam(required = false) String category,
                                            @RequestParam(required = false) String keyword) {
        return stockService.getStockSummary(pharmacyId, category, keyword);
    }

    @PostMapping("/update")
    public void updateStock(@RequestParam Long pharmacyId,
                            @RequestBody StockUpdateRequest request) {
        stockService.updateStock(pharmacyId, request);
    }

    @GetMapping("/transactions")
    public List<StockTransactionDTO> getTransactions(@RequestParam Long pharmacyId,
                                                     @RequestParam(required = false) Long productId) {
        return stockService.getStockTransactions(pharmacyId, productId);
    }

    @PostMapping("/statistics")
    public List<StockStatisticsDTO> getStatistics(@RequestBody StockStatisticsRequest request) {
        return stockService.getStockStatistics(request.getPharmacyId(), request.getFrom(), request.getTo());
    }
}
