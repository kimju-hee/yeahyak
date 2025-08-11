package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.HqStockDto;
import com.yeahyak.backend.dto.HqStockTxDto;
import com.yeahyak.backend.dto.JinhoResponse;   // ✅
import com.yeahyak.backend.service.HqStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hq/stocks")
@RequiredArgsConstructor
public class HqStockController {
    private final HqStockService service;

    @GetMapping
    public JinhoResponse<HqStockDto> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<HqStockDto> p = service.list(search, page, size);
        return JinhoResponse.<HqStockDto>builder()
                .success(true)
                .data(p.getContent())
                .totalPages(p.getTotalPages())
                .totalElements(p.getTotalElements())
                .currentPage(p.getNumber())
                .build();
    }

    @GetMapping("/{stockId}/transactions")
    public JinhoResponse<HqStockTxDto> transactions(@PathVariable Long stockId) {
        List<HqStockTxDto> list = service.transactions(stockId);
        return JinhoResponse.<HqStockTxDto>builder()
                .success(true)
                .data(list)
                .totalPages(1)
                .totalElements(list.size())
                .currentPage(0)
                .build();
    }
}
