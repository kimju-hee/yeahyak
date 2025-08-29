package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.InventoryTx;
import com.yeahyak.backend.entity.enums.InventoryTxType;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryTxRepository extends JpaRepository<InventoryTx, Long> {

  @Query("""
      SELECT i FROM InventoryTx i
      WHERE i.product.productId = :productId
      AND (:type IS NULL OR i.type = :type)
      AND (:start IS NULL OR i.createdAt >= :start)
      AND (:end IS NULL OR i.createdAt <= :end)
      ORDER BY i.createdAt DESC
      """)
  Page<InventoryTx> findByProductIdAndTypeAndCreatedAtBetween(
      @Param("productId") Long productId,
      @Param("type") InventoryTxType type,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable
  );
}
