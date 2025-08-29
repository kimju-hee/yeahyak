package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Returns;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReturnRepository extends JpaRepository<Returns, Long> {

  @Query("""
      SELECT r FROM Returns r
      WHERE r.pharmacy.pharmacyId = :pharmacyId
      AND (:status IS NULL OR r.status = :status)
      ORDER BY r.createdAt DESC
      """)
  Page<Returns> findByPharmacyIdAndStatus(
      @Param("pharmacyId") Long pharmacyId,
      @Param("status") ReturnStatus status,
      Pageable pageable
  );

  @Query("""
      SELECT r FROM Returns r
      WHERE (:status IS NULL OR r.status = :status)
      AND (:region IS NULL OR r.pharmacy.region = :region)
      AND (:start IS NULL OR r.createdAt >= :start)
      AND (:end IS NULL OR r.createdAt <= :end)
      ORDER BY r.createdAt DESC
      """)
  Page<Returns> findByStatusAndRegionAndCreatedAtBetween(
      @Param("status") ReturnStatus status,
      @Param("region") Region region,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable
  );
}
