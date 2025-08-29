package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.InventoryTxResponse;
import com.yeahyak.backend.entity.InventoryTx;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.InventoryTxType;
import com.yeahyak.backend.repository.InventoryTxRepository;
import com.yeahyak.backend.repository.ProductRepository;
import java.time.LocalDateTime;
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
public class InventoryTxService {

  private final InventoryTxRepository inventoryTxRepository;
  private final ProductRepository productRepository;

  /**
   * 재고 거래 내역을 생성하고, 해당 제품의 재고 수량을 업데이트합니다.
   */
  @Transactional
  public Long createInventoryTx(Long productId, InventoryTxType type, int amount) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("제품 정보를 찾을 수 없습니다."));

    int before = product.getInventoryQty();
    int after;

    switch (type) {
      case IN, ORDER_CANCEL, RETURN -> {
        productRepository.increaseInventoryQty(productId, amount);
        after = before + amount;
      }
      case ORDER -> {
        int updated = productRepository.decreaseInventoryQty(productId, amount);
        if (updated == 0) {
          throw new RuntimeException(product.getProductName() + "의 재고가 부족합니다.");
        }
        after = before - amount;
      }
      default -> throw new RuntimeException("잘못된 거래 유형입니다.");
    }

    InventoryTx inventoryTx = InventoryTx.builder()
        .product(product)
        .type(type)
        .amount(amount)
        .inventoryAfter(after)
        .build();
    inventoryTxRepository.save(inventoryTx);

    return inventoryTx.getInventoryTxId();
  }

  /**
   * 특정 제품의 재고 거래 내역을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<InventoryTxResponse> getInventoryTxs(
      Long productId, InventoryTxType type, LocalDateTime start, LocalDateTime end,
      int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return inventoryTxRepository.findByProductIdAndTypeAndCreatedAtBetween(
            productId, type, start, end, pageable
        )
        .map(inventoryTx -> InventoryTxResponse.builder()
            .inventoryTxId(inventoryTx.getInventoryTxId())
            .productId(productId)
            .type(type)
            .amount(inventoryTx.getAmount())
            .inventoryAfter(inventoryTx.getInventoryAfter())
            .createdAt(inventoryTx.getCreatedAt())
            .build());
  }
}
