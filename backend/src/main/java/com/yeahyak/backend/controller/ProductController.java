package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ProductCreateRequest;
import com.yeahyak.backend.dto.ProductCreateResponse;
import com.yeahyak.backend.dto.ProductDetailResponse;
import com.yeahyak.backend.dto.ProductListResponse;
import com.yeahyak.backend.dto.ProductUpdateRequest;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.service.ProductService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
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
 * 제품 관련 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping(value = "/api/products", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
public class ProductController {

  private final ProductService productService;

  /**
   * 제품을 생성합니다.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
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
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<ApiResponse<List<ProductListResponse>>> getProducts(
      @RequestParam(required = false) MainCategory mainCategory,
      @RequestParam(required = false) SubCategory subCategory,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "100") int stockQtyThreshold,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<ProductListResponse> result =
        productService.getProducts(mainCategory, subCategory, keyword, stockQtyThreshold, page,
            size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * 제품 상세를 조회합니다.
   */
  @PreAuthorize("isAuthenticated()")
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
  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping(path = "/{productId}", consumes = MediaType.APPLICATION_JSON_VALUE)
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
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{productId}")
  public ResponseEntity<Void> deleteProduct(
      @PathVariable Long productId
  ) {
    productService.deleteProduct(productId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 카테고리 맵을 조회합니다.
   */
  @PreAuthorize("isAuthenticated()")
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
