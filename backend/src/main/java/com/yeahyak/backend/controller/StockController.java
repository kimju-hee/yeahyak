package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.StockSummaryDTO;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

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

}
