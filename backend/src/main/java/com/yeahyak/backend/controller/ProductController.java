package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.JinhoResponse;
import com.yeahyak.backend.dto.ProductRequestDTO;
import com.yeahyak.backend.dto.ProductResponseDTO;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    public JinhoResponse<Long> registerProduct(@RequestBody ProductRequestDTO dto) {
        Long productId = productService.registerProduct(dto);
        return JinhoResponse.<Long>builder()
                .success(true)
                .data(List.of(productId))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }

    // 2. 전체 상품 조회 (비추천 - 페이징 없음)
    @GetMapping
    public JinhoResponse<ProductResponseDTO> getAllProducts() {
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
                        .productImgUrl(product.getProductImgUrl())
                        .unit(product.getUnit())
                        .unitPrice(product.getUnitPrice())
                        .isNarcotic(product.getIsNarcotic())
                        .createdAt(product.getCreatedAt())
                        .build())
                .toList();

        return JinhoResponse.<ProductResponseDTO>builder()
                .success(true)
                .data(dtoList)
                .totalPages(1)
                .totalElements(dtoList.size())
                .currentPage(0)
                .build();
    }

    // 3. 필터 + 키워드 + 페이지네이션 + 최신순 정렬
    @GetMapping("/filter")
    public JinhoResponse<ProductResponseDTO> getFilteredProducts(
            @RequestParam(required = false) MainCategory mainCategory,
            @RequestParam(required = false) SubCategory subCategory,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ProductResponseDTO> result = productService.getFilteredProducts(mainCategory, subCategory, keyword, page, size);

        return JinhoResponse.<ProductResponseDTO>builder()
                .success(true)
                .data(result.getContent())
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .currentPage(result.getNumber())
                .build();
    }

    // 4. 단일 상품 조회
    @GetMapping("/{id}")
    public JinhoResponse<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return JinhoResponse.<Product>builder()
                .success(true)
                .data(List.of(product))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }

    // 5. 상품 삭제
    @DeleteMapping("/{id}")
    public JinhoResponse<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return JinhoResponse.<String>builder()
                .success(true)
                .data(List.of("삭제되었습니다."))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }

    // 6. 상품 수정
    @PutMapping("/{id}")
    public JinhoResponse<Product> updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO dto) {
        Product updated = productService.updateProduct(id, dto);
        return JinhoResponse.<Product>builder()
                .success(true)
                .data(List.of(updated))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }

    // 7. 카테고리 리스트 조회
    @GetMapping("/categories")
    public JinhoResponse<Map<MainCategory, List<SubCategory>>> getCategoryMap() {
        Map<MainCategory, List<SubCategory>> map = Arrays.stream(SubCategory.values())
                .collect(Collectors.groupingBy(SubCategory::getMainCategory));

        return JinhoResponse.<Map<MainCategory, List<SubCategory>>>builder()
                .success(true)
                .data(List.of(map))  // 단일 Map을 List로 래핑
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }
}
