package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ProductRequestDTO;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ApiResponse<ResponseEntity<Long>> registerProduct(@RequestBody ProductRequestDTO dto) {
        Long productId = productService.registerProduct(dto);
        return new ApiResponse<>(true, ResponseEntity.ok(productId));
    }

    @GetMapping
    public ApiResponse<ResponseEntity<List<Product>>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return new ApiResponse<>(true, ResponseEntity.ok(products));
    }

    @GetMapping("/{id}")
    public ApiResponse<ResponseEntity<Product>> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return new ApiResponse<>(true, ResponseEntity.ok(product));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<ResponseEntity<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ApiResponse<>(true, ResponseEntity.noContent().build());
    }

    @PutMapping("/{id}")
    public ApiResponse<ResponseEntity<Product>> updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO dto) {
        Product updated = productService.updateProduct(id, dto);
        return new ApiResponse<>(true,ResponseEntity.ok(updated));
    }
}
