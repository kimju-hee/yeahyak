package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.StockInRequest;
import com.yeahyak.backend.dto.StockInResponse;
import com.yeahyak.backend.dto.StockTxDetailResponse;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.StockTx;
import com.yeahyak.backend.entity.enums.StockTxType;
import com.yeahyak.backend.repository.ProductRepository;
import com.yeahyak.backend.repository.StockTxRepository;
import com.yeahyak.backend.service.StockTxService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 재고 거래(입고/출고) 관련 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping(value = "/api/stock-txs", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
public class StockTxController {

  private final StockTxService stockTxService;
  private final ProductRepository productRepo;
  private final StockTxRepository stockTxRepo;

  /**
   * 제품 입고를 처리합니다.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping(path = "/in", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<ApiResponse<StockInResponse>> stockIn(
      @RequestBody @Valid StockInRequest request
  ) {
    Product before = productRepo.findById(request.getProductId())
        .orElseThrow(() -> new RuntimeException("제품 정보를 찾을 수 없습니다."));
    Integer quantityBefore = before.getStockQty();

    Long stockTxId = stockTxService.createStockTx(request.getProductId(), StockTxType.IN,
        request.getAmount());

    StockTx stockTx = stockTxRepo.findById(stockTxId)
        .orElseThrow(() -> new RuntimeException("재고 거래 내역을 찾을 수 없습니다."));

    StockInResponse res = StockInResponse.builder()
        .stockTxId(stockTx.getStockTxId())
        .productId(request.getProductId())
        .amount(request.getAmount())
        .quantityBefore(quantityBefore)
        .quantityAfter(stockTx.getQuantityAfter())
        .createdAt(stockTx.getCreatedAt())
        .build();

    URI location = URI.create("/api/stock-txs/" + stockTxId);
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * 특정 제품의 재고 거래 내역을 조회합니다.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping
  public ResponseEntity<ApiResponse<List<StockTxDetailResponse>>> listByProduct(
      @RequestParam Long productId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<StockTxDetailResponse> result = stockTxService.searchStockTxByProductId(
        productId, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }
}
