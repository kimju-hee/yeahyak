package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ProductRequestDTO;
import com.yeahyak.backend.dto.ProductResponseDTO;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Long registerProduct(ProductRequestDTO dto) {
        if (dto.getSubCategory().getMainCategory() != dto.getMainCategory()) {
            throw new IllegalArgumentException("메인 카테고리와 서브 카테고리가 일치하지 않습니다.");
        }

        String summary = callFlaskSummary(dto.getPdfPath());

        Product product = Product.builder()
                .productName(dto.getProductName())
                .productCode(dto.getProductCode())
                .mainCategory(dto.getMainCategory())
                .subCategory(dto.getSubCategory())
                .manufacturer(dto.getManufacturer())
                .details(summary)
                .unit(dto.getUnit())
                .unitPrice(dto.getUnitPrice())
                .productImgUrl(dto.getProductImgUrl())
                .build();

        return productRepository.save(product).getProductId();
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 ID의 약품을 찾을 수 없습니다."));
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Override
    public Product updateProduct(Long id, ProductRequestDTO dto) {
        Product product = getProductById(id);
        product.setProductName(dto.getProductName());
        product.setProductCode(dto.getProductCode());
        product.setMainCategory(dto.getMainCategory());
        product.setSubCategory(dto.getSubCategory());
        product.setManufacturer(dto.getManufacturer());
        product.setUnit(dto.getUnit());
        product.setUnitPrice(dto.getUnitPrice());
        product.setProductImgUrl(dto.getProductImgUrl());

        return productRepository.save(product);
    }

    private String callFlaskSummary(String pdfPath) {
        String url = "http://localhost:5000/summarize/pdf";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            FileSystemResource pdfFile = new FileSystemResource(pdfPath);
            body.add("file", pdfFile);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                if (Boolean.TRUE.equals(responseBody.get("success")) && responseBody.get("data") instanceof Map) {
                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    return (String) data.get("summary");
                }
            }
        } catch (Exception e) {
            System.err.println("Flask 요약 실패: " + e.getMessage());
        }
        return null;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getFilteredProducts(MainCategory mainCategory, SubCategory subCategory, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = productRepository.findFiltered(mainCategory, subCategory, keyword, pageable);

        return productPage.map(product -> ProductResponseDTO.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productCode(product.getProductCode())
                .mainCategory(product.getMainCategory())
                .subCategory(product.getSubCategory())
                .manufacturer(product.getManufacturer())
                .details(product.getDetails())
                .unit(product.getUnit())
                .unitPrice(product.getUnitPrice())
                .productImgUrl(product.getProductImgUrl())
                .createdAt(product.getCreatedAt())
                .build());
    }
}
