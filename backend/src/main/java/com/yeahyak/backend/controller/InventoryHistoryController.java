package com.yeahyak.backend.controller;

import com.yeahyak.backend.deprecated.InventoryHistoryService;
import com.yeahyak.backend.entity.enums.StockTxType;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventory")
public class InventoryHistoryController {

  private final InventoryHistoryService inventoryHistoryService;

  @GetMapping
  public ResponseEntity<?> getInventoryHistories(
      @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
      @RequestParam(required = false) StockTxType division,
      @RequestParam Long productId, // ✅ 추가 (필수)
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    return ResponseEntity.ok(
        inventoryHistoryService.getHistories(startDate, endDate, division, productId, page,
            size)); // ✅ 전달
  }
}
