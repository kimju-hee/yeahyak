package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ProductRequestDTO;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
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
        String summary = callFlaskSummary(dto.getPdfPath());

        Product product = Product.builder()
                .productName(dto.getProductName())
                .productCode(dto.getProductCode())
                .category(dto.getCategory())
                .manufacturer(dto.getManufacturer())
                .details(summary)
                .unit(dto.getUnit())
                .unitPrice(dto.getUnitPrice())
                .isNarcotic(dto.getIsNarcotic())
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
        product.setCategory(dto.getCategory());
        product.setManufacturer(dto.getManufacturer());
        product.setUnit(dto.getUnit());
        product.setUnitPrice(dto.getUnitPrice());
        product.setIsNarcotic(dto.getIsNarcotic());
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
                return (String) response.getBody().get("summary");
            } else {
                return "요약 실패";
            }
        } catch (Exception e) {
            return "요약 실패: " + e.getMessage();
        }
    }
}

