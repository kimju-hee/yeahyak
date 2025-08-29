package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.InventoryInRequest;
import com.yeahyak.backend.dto.InventoryInResponse;
import com.yeahyak.backend.dto.InventoryTxResponse;
import com.yeahyak.backend.dto.ProductCreateRequest;
import com.yeahyak.backend.dto.ProductCreateResponse;
import com.yeahyak.backend.dto.ProductDetailResponse;
import com.yeahyak.backend.dto.ProductListResponse;
import com.yeahyak.backend.dto.ProductUpdateRequest;
import com.yeahyak.backend.entity.InventoryTx;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.InventoryTxType;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.repository.InventoryTxRepository;
import com.yeahyak.backend.repository.ProductRepository;
import com.yeahyak.backend.service.InventoryTxService;
import com.yeahyak.backend.service.ProductService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 제품 관련 API 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;
  private final InventoryTxService inventoryTxService;
  private final ProductRepository productRepository;
  private final InventoryTxRepository inventoryTxRepository;

  /**
   * 제품을 생성합니다.
   */
  @PostMapping
  public ResponseEntity<ApiResponse<ProductCreateResponse>> createProduct(
      @RequestBody @Valid ProductCreateRequest request
  ) {
    ProductCreateResponse res = productService.createProduct(request);
    URI location = URI.create("/api/products/" + res.getProductId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * 제품 목록을 조회합니다. (카테고리/키워드/재고임계값 + 페이지네이션)
   */
  @GetMapping
  public ResponseEntity<ApiResponse<List<ProductListResponse>>> getProducts(
      @RequestParam(required = false) MainCategory mainCategory,
      @RequestParam(required = false) SubCategory subCategory,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "100") int threshold,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<ProductListResponse> result =
        productService.getProducts(mainCategory, subCategory, keyword, threshold, page,
            size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * 제품 상세를 조회합니다.
   */
  @GetMapping("/{productId}")
  public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductById(
      @PathVariable Long productId
  ) {
    ProductDetailResponse detail = productService.getProductById(productId);
    return ResponseEntity.ok(ApiResponse.ok(detail)); // 200 OK
  }

  /**
   * 제품을 수정합니다.
   */
  @PatchMapping("/{productId}")
  public ResponseEntity<Void> updateProduct(
      @PathVariable Long productId,
      @RequestBody @Valid ProductUpdateRequest request
  ) {
    productService.updateProduct(productId, request);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 제품을 삭제합니다.
   */
  @DeleteMapping("/{productId}")
  public ResponseEntity<Void> deleteProduct(
      @PathVariable Long productId
  ) {
    productService.deleteProduct(productId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 제품 입고를 처리합니다.
   */
  @PostMapping("{productId}/in")
  public ResponseEntity<ApiResponse<InventoryInResponse>> inventoryIn(
      @RequestBody @Valid InventoryInRequest request
  ) {
    Product product = productRepository.findById(request.getProductId())
        .orElseThrow(() -> new RuntimeException("제품 정보를 찾을 수 없습니다."));
    int before = product.getInventoryQty();

    Long inventoryTxId = inventoryTxService.createInventoryTx(
        request.getProductId(), InventoryTxType.IN, request.getAmount());

    InventoryTx inventoryTx = inventoryTxRepository.findById(inventoryTxId)
        .orElseThrow(() -> new RuntimeException("재고 거래 내역을 찾을 수 없습니다."));

    InventoryInResponse res = InventoryInResponse.builder()
        .inventoryTxId(inventoryTxId)
        .productId(request.getProductId())
        .amount(request.getAmount())
        .inventoryBefore(before)
        .inventoryAfter(inventoryTx.getInventoryAfter())
        .createdAt(inventoryTx.getCreatedAt())
        .build();

    return ResponseEntity.ok(ApiResponse.ok(res)); // 200 OK
  }

  /**
   * 특정 제품의 재고 거래 내역을 조회합니다.
   */
  @GetMapping("/{productId}/inventory-txs")
  public ResponseEntity<ApiResponse<List<InventoryTxResponse>>> getInventoryTxsByProduct(
      @RequestParam Long productId,
      @RequestParam(required = false) InventoryTxType type,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<InventoryTxResponse> result = inventoryTxService.getInventoryTxs(
        productId, type, start, end, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * 카테고리 맵을 조회합니다.
   */
  @GetMapping("/categories")
  public ResponseEntity<ApiResponse<Map<MainCategory, List<SubCategory>>>> getCategoryMap() {
    Map<MainCategory, List<SubCategory>> map =
        Arrays.stream(SubCategory.values())
            .collect(Collectors
                .groupingBy(SubCategory::getMainCategory,
                    () -> new EnumMap<>(MainCategory.class),
                    Collectors.toList()
                ));
    return ResponseEntity.ok(ApiResponse.ok(map)); // 200 OK
  }
}
