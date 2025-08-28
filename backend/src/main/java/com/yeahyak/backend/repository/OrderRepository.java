package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Orders;
import com.yeahyak.backend.entity.enums.OrderStatus;
import com.yeahyak.backend.entity.enums.Region;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Orders, Long> {

  @Query("""
      SELECT o FROM Orders o
      WHERE o.pharmacy.pharmacyId = :pharmacyId
      AND (:status IS NULL OR o.status = :status)
      """)
  Page<Orders> findByPharmacy_PharmacyIdAndStatus(
      @Param("pharmacyId") Long pharmacyId,
      @Param("status") OrderStatus status,
      Pageable pageable
  );

  @Query("""
      SELECT o FROM Orders o
      WHERE (:status IS NULL OR o.status = :status)
      AND (:region IS NULL OR o.pharmacy.region = :region)
      AND (:start IS NULL OR o.createdAt >= :start)
      AND (:end IS NULL OR o.createdAt <= :end)
      """)
  Page<Orders> findByStatusAndRegionAndCreatedAtBetween(
      @Param("status") OrderStatus status,
      @Param("region") Region region,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable
  );
}
