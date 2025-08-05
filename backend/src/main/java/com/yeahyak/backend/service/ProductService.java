package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ProductRequestDTO;
import com.yeahyak.backend.dto.ProductResponseDTO;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {
    Long registerProduct(ProductRequestDTO dto);
    List<Product> getAllProducts();
    Product getProductById(Long id);
    void deleteProduct(Long id);
    Product updateProduct(Long id, ProductRequestDTO dto);
    Page<ProductResponseDTO> getFilteredProducts(MainCategory mainCategory, SubCategory subCategory, String keyword, int page, int size);
}
