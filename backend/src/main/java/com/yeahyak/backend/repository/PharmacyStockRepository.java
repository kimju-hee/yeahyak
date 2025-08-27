package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyStockRepository extends JpaRepository<PharmacyStock, Long> {

    Optional<PharmacyStock> findByPharmacyAndProduct(Pharmacy pharmacy, Product product);

    @Query("SELECT ps FROM PharmacyStock ps WHERE ps.pharmacy.pharmacyId = :pharmacyId " +
            "AND (:mainCategory IS NULL OR ps.product.mainCategory = :mainCategory) " +
            "AND (:subCategory IS NULL OR ps.product.subCategory = :subCategory) " +
            "AND (:keyword IS NULL OR ps.product.productName LIKE %:keyword%)")
    List<PharmacyStock> findFilteredStocks(
            @Param("pharmacyId") Long pharmacyId,
            @Param("mainCategory") MainCategory mainCategory,
            @Param("subCategory") SubCategory subCategory,
            @Param("keyword") String keyword
    );

    @Query("SELECT ps FROM PharmacyStock ps WHERE ps.pharmacy.pharmacyId = :pharmacyId " +
            "AND (:mainCategory IS NULL OR ps.product.mainCategory = :mainCategory) " +
            "AND (:subCategory IS NULL OR ps.product.subCategory = :subCategory) " +
            "AND (:keyword IS NULL OR ps.product.productName LIKE %:keyword%)")
    Page<PharmacyStock> findFilteredStocks(
            @Param("pharmacyId") Long pharmacyId,
            @Param("mainCategory") MainCategory mainCategory,
            @Param("subCategory") SubCategory subCategory,
            @Param("keyword") String keyword,
            Pageable pageable
    );

}