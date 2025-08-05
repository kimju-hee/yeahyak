package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ProductRequestDTO;
import com.yeahyak.backend.dto.ProductResponseDTO;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 1. 상품 등록
    @PostMapping
    public ApiResponse<ResponseEntity<Long>> registerProduct(@RequestBody ProductRequestDTO dto) {
        Long productId = productService.registerProduct(dto);
        return new ApiResponse<>(true, ResponseEntity.ok(productId));
    }

    // 2. 전체 상품 조회 (비추천 - 페이징 없이 모든 상품 반환)
    @GetMapping
    public ApiResponse<ResponseEntity<List<ProductResponseDTO>>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        List<ProductResponseDTO> dtoList = products.stream()
                .map(product -> ProductResponseDTO.builder()
                        .productId(product.getProductId())
                        .productName(product.getProductName())
                        .productCode(product.getProductCode())
                        .mainCategory(product.getMainCategory())
                        .subCategory(product.getSubCategory())
                        .manufacturer(product.getManufacturer())
                        .details(product.getDetails())
                        .unit(product.getUnit())
                        .unitPrice(product.getUnitPrice())
                        .isNarcotic(product.getIsNarcotic())
                        .createdAt(product.getCreatedAt())
                        .build())
                .toList();

        return new ApiResponse<>(true, ResponseEntity.ok(dtoList));
    }

    // ✅ 3. 필터 + 키워드 + 페이지네이션 + 최신순 정렬
    @GetMapping("/filter")
    public ApiResponse<ResponseEntity<Page<ProductResponseDTO>>> getFilteredProducts(
            @RequestParam(required = false) MainCategory mainCategory,
            @RequestParam(required = false) SubCategory subCategory,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ProductResponseDTO> result = productService.getFilteredProducts(mainCategory, subCategory, keyword, page, size);
        return new ApiResponse<>(true, ResponseEntity.ok(result));
    }

    // 4. 단일 상품 조회
    @GetMapping("/{id}")
    public ApiResponse<ResponseEntity<Product>> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return new ApiResponse<>(true, ResponseEntity.ok(product));
    }

    // 5. 상품 삭제
    @DeleteMapping("/{id}")
    public ApiResponse<ResponseEntity<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ApiResponse<>(true, ResponseEntity.noContent().build());
    }

    // 6. 상품 수정
    @PutMapping("/{id}")
    public ApiResponse<ResponseEntity<Product>> updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO dto) {
        Product updated = productService.updateProduct(id, dto);
        return new ApiResponse<>(true, ResponseEntity.ok(updated));
    }

    // 7. 카테고리 리스트 조회 (메인카테고리별 서브카테고리 분류)
    @GetMapping("/categories")
    public ApiResponse<?> getCategoryMap() {
        Map<MainCategory, List<SubCategory>> map = Arrays.stream(SubCategory.values())
                .collect(Collectors.groupingBy(SubCategory::getMainCategory));

        return new ApiResponse<>(true, map);
    }
}
