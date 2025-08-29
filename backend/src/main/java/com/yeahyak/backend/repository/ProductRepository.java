package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.InventoryTxType;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

  List<Product> findByInsuranceCodeIn(Collection<String> insuranceCodes);

  @Query("""
      SELECT p FROM Product p
      WHERE p.mainCategory = :mainCategory
      AND (:subCategory IS NULL OR p.subCategory = :subCategory)
      AND (
        COALESCE(:keyword, '') = ''
        OR p.productName LIKE CONCAT('%', :keyword, '%')
      )
      AND (:threshold IS NULL OR p.inventoryQty <= :threshold)
      ORDER BY p.createdAt DESC
      """)
  Page<Product> findByMainCategoryAndSubCategoryAndProductNameAndThreshold(
      @Param("mainCategory") MainCategory mainCategory,
      @Param("subCategory") SubCategory subCategory,
      @Param("keyword") String keyword,
      @Param("threshold") Integer threshold,
      Pageable pageable
  );

  @Query("""
      SELECT p.productId AS productId, MAX(i.createdAt) AS latestInAt
      FROM Product p
      LEFT JOIN InventoryTx i ON p.productId = s.product.productId AND s.type = :type
      WHERE p.productId IN :productIds
      GROUP BY p.productId
      """)
  List<ProductLatestInProjection> findLatestInDatesByProductIds(
      @Param("productIds") List<Long> productIds,
      @Param("type") InventoryTxType type
  );

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Product p
      SET p.inventoryQty = p.inventoryQty - :amount
      WHERE p.productId = :productId AND p.inventoryQty >= :amount
      """)
  int decreaseInventoryQty(
      @Param("productId") Long productId,
      @Param("amount") Integer amount
  );

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Product p
      SET p.inventoryQty = p.inventoryQty + :amount
      WHERE p.productId = :productId
      """)
  int increaseInventoryQty(
      @Param("productId") Long productId,
      @Param("amount") Integer amount
  );

  interface ProductLatestInProjection {

    Long getProductId();

    LocalDateTime getLatestInAt();
  }
}
