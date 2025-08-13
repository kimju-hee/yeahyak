package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p
        WHERE (:mainCategory IS NULL OR p.mainCategory = :mainCategory)
          AND (:subCategory IS NULL OR p.subCategory = :subCategory)
          AND (:keyword IS NULL OR p.productName LIKE %:keyword%)
    """)
    Page<Product> findFiltered(
            @Param("mainCategory") MainCategory mainCategory,
            @Param("subCategory") SubCategory subCategory,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // 재고가 충분할 때만 차감(성공 1 / 실패 0)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE Product p
           SET p.stock = p.stock - :qty
         WHERE p.productId = :id
           AND p.stock >= :qty
    """)
    int tryDeductStock(@Param("id") Long productId, @Param("qty") int quantity);

    // 재고 복구 (거절/반품 승인 시)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE Product p
           SET p.stock = p.stock + :qty
         WHERE p.productId = :id
    """)
    int restoreStock(@Param("id") Long productId, @Param("qty") int quantity);
}
