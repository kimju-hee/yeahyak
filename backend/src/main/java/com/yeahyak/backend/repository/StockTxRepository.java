package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.StockTx;
import com.yeahyak.backend.entity.enums.StockTxType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockTxRepository extends JpaRepository<StockTx, Long> {

  Page<StockTx> findByProduct_ProductId(
      @Param("productId") Long productId,
      Pageable pageable
  );

  @Query("""
      SELECT s.product.productId AS productId, MAX(s.createdAt) AS latestInAt
      FROM StockTx s
      WHERE s.product.productId IN :productIds
      AND s.type = :type
      GROUP BY s.product.productId
      """)
  List<ProductLatestInProjection> findLatestInDatesByProductIds(
      @Param("productIds") List<Long> productIds,
      @Param("type") StockTxType type
  );

  interface ProductLatestInProjection {

    Long getProductId();

    LocalDateTime getLatestInAt();
  }

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Product p
      SET p.stockQty = p.stockQty - :amount
      WHERE p.productId = :productId AND p.stockQty >= :amount
      """)
  int decreaseStockQty(
      @Param("productId") Long productId,
      @Param("amount") Integer amount
  );

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Product p
      SET p.stockQty = p.stockQty + :amount
      WHERE p.productId = :productId
      """)
  int increaseStockQty(
      @Param("productId") Long productId,
      @Param("amount") Integer amount
  );
}
