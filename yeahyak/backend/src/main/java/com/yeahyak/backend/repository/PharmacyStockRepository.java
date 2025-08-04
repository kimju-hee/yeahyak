package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyStockRepository extends JpaRepository<PharmacyStock, Long> {

    Optional<PharmacyStock> findByPharmacyAndProduct(Pharmacy pharmacy, Product product);

    @Query("SELECT ps FROM PharmacyStock ps WHERE ps.pharmacy.pharmacyId = :pharmacyId " +
            "AND (:category IS NULL OR ps.product.category = :category) " +
            "AND (:keyword IS NULL OR ps.product.productName LIKE %:keyword%)")
    List<PharmacyStock> findFilteredStocks(Long pharmacyId, String category, String keyword);
}