package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ProductCreateRequest;
import com.yeahyak.backend.dto.ProductCreateResponse;
import com.yeahyak.backend.dto.ProductDetailResponse;
import com.yeahyak.backend.dto.ProductListResponse;
import com.yeahyak.backend.dto.ProductUpdateRequest;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.InventoryTxType;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.repository.ProductRepository;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 제품과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

  private final ProductRepository productRepository;
  private final InventoryTxService inventoryTxService;

  /**
   * 제품을 생성하고, 초기 재고 수량만큼 재고 입고 거래 내역을 생성합니다.
   */
  @Transactional
  public ProductCreateResponse createProduct(ProductCreateRequest req) {
    Product product = Product.builder()
        .productName(req.getProductName())
        .insuranceCode(req.getInsuranceCode())
        .mainCategory(req.getMainCategory())
        .subCategory(req.getSubCategory())
        .manufacturer(req.getManufacturer())
        .unit(req.getUnit())
        .unitPrice(req.getUnitPrice())
        .details(req.getDetails())
        .productImgUrl(req.getProductImgUrl())
        .inventoryQty(0)
        .build();
    productRepository.save(product);

    long inventoryTxId = inventoryTxService.createInventoryTx(
        product.getProductId(), InventoryTxType.IN, req.getInventoryQty()
    );
    return new ProductCreateResponse(product.getProductId(), inventoryTxId);
  }

  /**
   * 제품 목록을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<ProductListResponse> getProducts(
      MainCategory mainCategory, SubCategory subCategory, String keyword, int threshold,
      int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size);
    Page<Product> products =
        productRepository.findByMainCategoryAndSubCategoryAndProductNameAndThreshold(
            mainCategory, subCategory, keyword, threshold, pageable
        );

    List<Long> productIds = products.stream().map(Product::getProductId).toList();
    final Map<Long, LocalDateTime> latestInMap = productIds.isEmpty()
        ? Collections.emptyMap()
        : productRepository.findLatestInDatesByProductIds(
            productIds, InventoryTxType.IN
        ).stream().collect(Collectors.toMap(
            ProductRepository.ProductLatestInProjection::getProductId,
            ProductRepository.ProductLatestInProjection::getLatestInAt
        ));

    return products.map(product -> ProductListResponse.builder()
        .productId(product.getProductId())
        .productName(product.getProductName())
        .manufacturer(product.getManufacturer())
        .unit(product.getUnit())
        .unitPrice(product.getUnitPrice())
        .productImgUrl(product.getProductImgUrl())
        .inventoryQty(product.getInventoryQty())
        .latestInventoryInAt(latestInMap.get(product.getProductId()))
        .build());
  }

  /**
   * 제품 상세를 조회합니다.
   */
  @Transactional(readOnly = true)
  public ProductDetailResponse getProductById(Long productId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));
    return ProductDetailResponse.builder()
        .productId(product.getProductId())
        .productName(product.getProductName())
        .insuranceCode(product.getInsuranceCode())
        .mainCategory(product.getMainCategory())
        .subCategory(product.getSubCategory())
        .manufacturer(product.getManufacturer())
        .unit(product.getUnit())
        .unitPrice(product.getUnitPrice())
        .details(product.getDetails())
        .productImgUrl(product.getProductImgUrl())
        .createdAt(product.getCreatedAt())
        .inventoryQty(product.getInventoryQty())
        .build();
  }

  /**
   * 제품 정보를 수정합니다.
   */
  @Transactional
  public void updateProduct(Long productId, ProductUpdateRequest req) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));

    if (req.getProductName() != null) {
      product.setProductName(req.getProductName());
    }
    if (req.getInsuranceCode() != null) {
      product.setInsuranceCode(req.getInsuranceCode());
    }
    if (req.getMainCategory() != null) {
      product.setMainCategory(req.getMainCategory());
    }
    if (req.getSubCategory() != null) {
      product.setSubCategory(req.getSubCategory());
    }
    if (req.getManufacturer() != null) {
      product.setManufacturer(req.getManufacturer());
    }
    if (req.getUnit() != null) {
      product.setUnit(req.getUnit());
    }
    if (req.getUnitPrice() != null) {
      product.setUnitPrice(req.getUnitPrice());
    }
    if (req.getDetails() != null) {
      product.setDetails(req.getDetails());
    }
    if (req.getProductImgUrl() != null) {
      product.setProductImgUrl(req.getProductImgUrl());
    }
    productRepository.save(product);
  }

  /**
   * 재고가 남아 있지 않은 제품을 삭제합니다.
   */
  @Transactional
  public void deleteProduct(Long productId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));
    if (product.getInventoryQty() != null && product.getInventoryQty() > 0) {
      throw new RuntimeException("재고가 남아 있어 삭제할 수 없습니다.");
    }
    productRepository.delete(product);
  }
}
