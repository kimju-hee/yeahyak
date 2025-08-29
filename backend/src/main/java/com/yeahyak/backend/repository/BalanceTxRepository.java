package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.BalanceTx;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BalanceTxRepository extends JpaRepository<BalanceTx, Long> {

  @Query("""
      SELECT b FROM BalanceTx b
      WHERE b.pharmacy.pharmacyId = :pharmacyId
      AND (:type IS NULL OR b.type = :type)
      AND (:start IS NULL OR b.createdAt >= :start)
      AND (:end IS NULL OR b.createdAt <= :end)
      ORDER BY b.createdAt DESC
      """)
  Page<BalanceTx> findByPharmacyIdAndTypeAndCreatedAtBetween(
      @Param("pharmacyId") Long pharmacyId,
      @Param("type") BalanceTxType type,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable
  );
}
