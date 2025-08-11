package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.HqStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface HqStockRepository extends JpaRepository<HqStock, Long> {

    // 목록 조회(제품 정보 join + 트랜잭션으로 최종 입/출고일 집계) - Native로 간단히
    @Query(
      value = """
        SELECT
          s.stock_id,
          p.product_id,
          p.product_code,
          p.product_name,
          p.unit,
          s.quantity,
          DATE_FORMAT(MAX(CASE WHEN t.type IN ('IN','RETURN_IN') THEN t.created_at END),'%Y-%m-%d') AS lastInboundDate,
          DATE_FORMAT(MAX(CASE WHEN t.type='OUT' THEN t.created_at END),'%Y-%m-%d') AS lastOutboundDate
        FROM hq_stocks s
        JOIN products p ON p.product_id = s.product_id
        LEFT JOIN hq_stock_transactions t ON t.hq_stock_id = s.stock_id
        WHERE (:q IS NULL OR LOWER(p.product_code) LIKE LOWER(CONCAT('%',:q,'%'))
               OR LOWER(p.product_name) LIKE LOWER(CONCAT('%',:q,'%')))
        GROUP BY s.stock_id,p.product_id,p.product_code,p.product_name,p.unit,s.quantity
        ORDER BY p.product_name
        """,
      countQuery = """
        SELECT COUNT(*) FROM hq_stocks s
        JOIN products p ON p.product_id = s.product_id
        WHERE (:q IS NULL OR LOWER(p.product_code) LIKE LOWER(CONCAT('%',:q,'%'))
               OR LOWER(p.product_name) LIKE LOWER(CONCAT('%',:q,'%')))
        """,
      nativeQuery = true
    )
    Page<Object[]> search(@Param("q") String q, Pageable pageable);
}
