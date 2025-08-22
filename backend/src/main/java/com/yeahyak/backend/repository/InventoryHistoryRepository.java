package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.InventoryHistory;
import com.yeahyak.backend.entity.enums.InventoryDivision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List; // ✅ 추가

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    @Query("SELECT i FROM InventoryHistory i " +
            "WHERE (:startDate IS NULL OR i.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR i.createdAt <= :endDate) " +
            "AND (:division IS NULL OR i.division = :division) " +
            "AND (:productId IS NULL OR i.product.id = :productId)") // ✅ 추가
    Page<InventoryHistory> findAllWithFilters(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("division") InventoryDivision division,
            @Param("productId") Long productId,                     // ✅ 추가
            Pageable pageable
    );

    // ✅ IN/RETURN_IN 최신 일시 (productId -> lastInboundAt)
    @Query("""
        select ih.product.id as productId, max(ih.createdAt) as lastInboundAt
        from InventoryHistory ih
        where ih.division in (com.yeahyak.backend.entity.enums.InventoryDivision.IN,
                              com.yeahyak.backend.entity.enums.InventoryDivision.RETURN_IN)
          and ih.product.id in :productIds
        group by ih.product.id
    """)
    List<Object[]> findLastInboundAtByProductIds(@Param("productIds") List<Long> productIds);

    // ✅ OUT 최신 일시 (productId -> lastOutboundAt)
    @Query("""
        select ih.product.id as productId, max(ih.createdAt) as lastOutboundAt
        from InventoryHistory ih
        where ih.division = com.yeahyak.backend.entity.enums.InventoryDivision.OUT
          and ih.product.id in :productIds
        group by ih.product.id
    """)
    List<Object[]> findLastOutboundAtByProductIds(@Param("productIds") List<Long> productIds);

    // ✅ 현재 재고 집계 (productId -> stock)
    //    IN, RETURN_IN 은 +, OUT 은 - 로 합산해서 현재 재고를 계산한다.
    @Query(value = """
        SELECT product_id,
               SUM(CASE
                     WHEN division IN ('IN','RETURN_IN') THEN quantity
                     WHEN division = 'OUT'               THEN -quantity
                     ELSE 0
                   END) AS stock
        FROM inventory_history
        WHERE product_id IN (:productIds)
        GROUP BY product_id
        """, nativeQuery = true)
    List<Object[]> findCurrentStockByProductIds(@Param("productIds") List<Long> productIds);
}
