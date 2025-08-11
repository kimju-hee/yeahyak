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

    List<Order> findByPharmacy_PharmacyIdAndCreatedAtBetween(
            Long pharmacyId,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );


    @Query("""
    SELECT o FROM Order o
    WHERE (:status IS NULL OR o.status = :status)
      AND (:pharmacyName IS NULL OR :pharmacyName = '' 
           OR LOWER(o.pharmacy.pharmacyName) LIKE LOWER(CONCAT('%', :pharmacyName, '%')))
    """)
    Page<Order> findAllWithFilters(
            @Param("status") OrderStatus status,
            @Param("pharmacyName") String pharmacyName,
            Pageable pageable
    );

    @Query("""
    SELECT o FROM Order o
    WHERE o.pharmacy.pharmacyId = :pharmacyId
      AND (:status IS NULL OR o.status = :status)
    """)
    Page<Order> findByPharmacyAndOptionalStatus(
            @Param("pharmacyId") Long pharmacyId,
            @Param("status") OrderStatus status,
            Pageable pageable
    );
}
