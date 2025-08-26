package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.StockTxDetailResponse;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.StockTx;
import com.yeahyak.backend.entity.enums.StockTxType;
import com.yeahyak.backend.repository.ProductRepository;
import com.yeahyak.backend.repository.StockTxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 재고 거래 내역과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class StockTxService {

  private final StockTxRepository stockTxRepo;
  private final ProductRepository productRepo;

  /**
   * 재고 거래 내역을 생성하고, 해당 제품의 재고 수량을 업데이트합니다.
   */
  @Transactional
  public Long createStockTx(Long productId, StockTxType type, int amount) {
    boolean isIn = switch (type) {
      case IN, REJECT_IN, CANCEL_IN, RETURN_IN -> true;
      case OUT -> false;
      default -> throw new RuntimeException("잘못된 거래 유형입니다.");
    };

    if (isIn) {
      stockTxRepo.increaseStockQty(productId, amount);
    } else {
      int updated = stockTxRepo.decreaseStockQty(productId, amount);
      if (updated == 0) {
        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("제품 정보를 찾을 수 없습니다."));
        throw new RuntimeException(product.getProductName() + "의 재고가 부족합니다.");
      }
    }

    Product product = productRepo.findById(productId)
        .orElseThrow(() -> new RuntimeException("제품 정보를 찾을 수 없습니다."));

    StockTx stockTx = StockTx.builder()
        .product(product)
        .type(type)
        .amount(amount)
        .quantityAfter(product.getStockQty())
        .build();
    stockTxRepo.save(stockTx);

    return stockTx.getStockTxId();
  }

  /**
   * 특정 제품의 재고 거래 내역을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<StockTxDetailResponse> searchStockTxByProductId(
      Long productId, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return stockTxRepo.findByProduct_ProductId(productId, pageable)
        .map(stockTx -> StockTxDetailResponse.builder()
            .stockTxId(stockTx.getStockTxId())
            .productId(productId)
            .type(stockTx.getType())
            .amount(stockTx.getAmount())
            .quantityAfter(stockTx.getQuantityAfter())
            .createdAt(stockTx.getCreatedAt())
            .build());
  }
}
