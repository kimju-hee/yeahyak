package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.BalanceTx;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BalanceTxRepository extends JpaRepository<BalanceTx, Long> {

  @Query("""
      SELECT b FROM BalanceTx b
      WHERE b.pharmacy.pharmacyId = :pharmacyId
      AND (:type IS NULL OR b.type = :type)
      AND (:start IS NULL OR b.createdAt >= :start)
      AND (:end IS NULL OR b.createdAt <= :end)
      """)
  Page<BalanceTx> findByPharmacy_PharmacyIdAndTypeAndCreatedAtBetween(
      @Param("pharmacyId") Long pharmacyId,
      @Param("type") BalanceTxType type,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable
  );

  @Query("""
      SELECT b.pharmacy.pharmacyId AS pharmacyId, MAX(b.createdAt) AS latestSettlementAt
      FROM BalanceTx b
      WHERE b.pharmacy.pharmacyId IN :pharmacyIds
      AND b.type = :type
      GROUP BY b.pharmacy.pharmacyId
      """)
  List<PharmacyLatestSettlementProjection> findLatestSettlementDateByPharmacyIds(
      @Param("pharmacyIds") List<Long> pharmacyIds,
      @Param("type") BalanceTxType type
  );

  interface PharmacyLatestSettlementProjection {

    Long getPharmacyId();

    LocalDateTime getLatestSettlementAt();
  }

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Pharmacy p
      SET p.outstandingBalance = p.outstandingBalance + :amount
      WHERE p.pharmacyId = :pharmacyId
      """)
  int increaseBalance(
      @Param("pharmacyId") Long pharmacyId,
      @Param("amount") BigDecimal amount
  );

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Pharmacy p
      SET p.outstandingBalance = p.outstandingBalance - :amount
      WHERE p.pharmacyId = :pharmacyId
      """)
  int decreaseBalance(
      @Param("pharmacyId") Long pharmacyId,
      @Param("amount") BigDecimal amount
  );
}
