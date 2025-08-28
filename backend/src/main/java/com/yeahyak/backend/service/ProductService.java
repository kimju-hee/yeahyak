package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ProductCreateRequest;
import com.yeahyak.backend.dto.ProductCreateResponse;
import com.yeahyak.backend.dto.ProductDetailResponse;
import com.yeahyak.backend.dto.ProductListResponse;
import com.yeahyak.backend.dto.ProductUpdateRequest;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.StockTxType;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.repository.ProductRepository;
import com.yeahyak.backend.repository.StockTxRepository;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

  private final ProductRepository productRepo;
  private final StockTxRepository stockTxRepo;
  private final StockTxService stockTxService;

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
        .stockQty(0)
        .build();
    productRepo.save(product);

    long stockTxId = stockTxService.createStockTx(
        product.getProductId(), StockTxType.IN, req.getStockQty()
    );
    return new ProductCreateResponse(product.getProductId(), stockTxId);
  }

  @Transactional(readOnly = true)
  public Page<ProductListResponse> getProducts(
      MainCategory mainCategory, SubCategory subCategory, String keyword, int stockQtyThreshold,
      int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    Page<Product> products = productRepo.findByMainCategoryAndSubCategoryAndProductNameAndStockQty(
        mainCategory, subCategory, keyword, stockQtyThreshold, pageable
    );
    List<Long> productIds = products.stream()
        .map(Product::getProductId)
        .toList();
    final Map<Long, LocalDateTime> latestInMap = productIds.isEmpty()
        ? Collections.emptyMap()
        : stockTxRepo.findLatestInDatesByProductIds(productIds, StockTxType.IN).stream()
            .collect(Collectors.toMap(
                StockTxRepository.ProductLatestInProjection::getProductId,
                StockTxRepository.ProductLatestInProjection::getLatestInAt
            ));

    return products.map(product -> ProductListResponse.builder()
        .productId(product.getProductId())
        .productName(product.getProductName())
        .manufacturer(product.getManufacturer())
        .unit(product.getUnit())
        .unitPrice(product.getUnitPrice())
        .productImgUrl(product.getProductImgUrl())
        .stockQty(product.getStockQty())
        .latestStockInAt(latestInMap.get(product.getProductId()))
        .build());
  }

  @Transactional(readOnly = true)
  public ProductDetailResponse getProductById(Long productId) {
    Product product = productRepo.findById(productId)
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
        .stockQty(product.getStockQty())
        .build();
  }

  @Transactional
  public void updateProduct(Long productId, ProductUpdateRequest req) {
    Product product = productRepo.findById(productId)
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
    productRepo.save(product);
  }

  @Transactional
  public void deleteProduct(Long productId) {
    Product product = productRepo.findById(productId)
        .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));
    if (product.getStockQty() != null && product.getStockQty() > 0) {
      throw new RuntimeException("재고가 남아 있어 삭제할 수 없습니다.");
    }
    productRepo.delete(product);
  }
}
