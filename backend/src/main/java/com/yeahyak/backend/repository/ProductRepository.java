package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p " +
            "WHERE (:mainCategory IS NULL OR p.mainCategory = :mainCategory) " +
            "AND (:subCategory IS NULL OR p.subCategory = :subCategory) " +
            "AND (:keyword IS NULL OR p.productName LIKE %:keyword%)")
    Page<Product> findFiltered(
            @Param("mainCategory") MainCategory mainCategory,
            @Param("subCategory") SubCategory subCategory,
            @Param("keyword") String keyword,
            Pageable pageable
    );

}
