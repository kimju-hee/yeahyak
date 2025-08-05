package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Order;
import com.yeahyak.backend.entity.OrderItems;
import com.yeahyak.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByPharmacy_PharmacyIdAndCreatedAtBetween(Long pharmacyId, LocalDateTime start, LocalDateTime end);
    Page<Order> findByPharmacy_PharmacyIdAndStatus(Long pharmacyId, OrderStatus status, Pageable pageable);

    @Query("""
                SELECT o FROM Order o
                WHERE (:status IS NULL OR o.status = :status)
                  AND (:pharmacyName IS NULL OR o.pharmacy.pharmacyName LIKE %:pharmacyName%)
                ORDER BY o.createdAt DESC
            """)
    Page<Order> findAllWithFilters(
            @Param("status") String status,
            @Param("pharmacyName") String pharmacyName,
            Pageable pageable
    );

    @Query("""
                SELECT o FROM Order o
                WHERE o.pharmacy.pharmacyId = :pharmacyId
                  AND (:status IS NULL OR o.status = :status)
                ORDER BY o.createdAt DESC
            """)
    Page<Order> findByPharmacyAndStatus(
            @Param("pharmacyId") Long pharmacyId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("""
    SELECT o FROM Order o
    WHERE o.pharmacy.pharmacyId = :pharmacyId
      AND (:status IS NULL OR o.status = :status)
    ORDER BY o.createdAt DESC
""")
    Page<Order> findByPharmacyAndOptionalStatus(
            @Param("pharmacyId") Long pharmacyId,
            @Param("status") String status,
            Pageable pageable
    );

}
