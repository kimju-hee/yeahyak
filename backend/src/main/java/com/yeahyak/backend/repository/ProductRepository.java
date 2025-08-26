package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

  List<Product> findByInsuranceCodeIn(Collection<String> insuranceCodes);

  @Query("""
      SELECT p FROM Product p
      WHERE p.mainCategory = :mainCategory
      AND (:subCategory IS NULL OR p.subCategory = :subCategory)
      AND (:keyword IS NULL OR p.productName LIKE CONCAT('%', :keyword, '%'))
      """)
  Page<Product> findByMainCategoryAndSubCategoryAndProductName(
      @Param("mainCategory") MainCategory mainCategory,
      @Param("subCategory") SubCategory subCategory,
      @Param("keyword") String keyword,
      Pageable pageable
  );

  @Query("""
      SELECT p FROM Product p
      WHERE p.mainCategory = :mainCategory
      AND (:subCategory IS NULL OR p.subCategory = :subCategory)
      AND (:keyword IS NULL OR p.productName LIKE CONCAT('%', :keyword, '%'))
      AND (:stockQtyThreshold IS NULL OR p.stockQty <= :stockQtyThreshold)
      """)
  Page<Product> findByMainCategoryAndSubCategoryAndProductNameAndStockQty(
      @Param("mainCategory") MainCategory mainCategory,
      @Param("subCategory") SubCategory subCategory,
      @Param("keyword") String keyword,
      @Param("stockQtyThreshold") Integer stockQtyThreshold,
      Pageable pageable
  );
}
