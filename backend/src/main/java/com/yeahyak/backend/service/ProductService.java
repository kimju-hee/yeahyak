package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ProductRequestDTO;
import com.yeahyak.backend.entity.Product;

import java.util.List;

public interface ProductService {
    Long registerProduct(ProductRequestDTO dto);
    List<Product> getAllProducts();
    Product getProductById(Long id);
    void deleteProduct(Long id);
    Product updateProduct(Long id, ProductRequestDTO dto);
}
