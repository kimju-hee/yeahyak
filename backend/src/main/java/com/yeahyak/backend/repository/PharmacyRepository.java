package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import com.yeahyak.backend.entity.enums.Region;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {

  boolean existsByUser(User user);

  Optional<Pharmacy> findByUser(User user);

  boolean existsByBizRegNo(String bizRegNo);

  @Query("""
      SELECT p FROM Pharmacy p
      WHERE (
        :unsettled IS NULL
        OR (:unsettled = TRUE AND p.balance > 0)
        OR (:unsettled = FALSE AND p.balance = 0)
      )
      AND (:region IS NULL OR p.region = :region)
      AND (
        COALESCE(:keyword, '') = ''
        OR p.pharmacyName LIKE CONCAT('%', :keyword, '%')
      )
      ORDER BY p.pharmacyId DESC
      """)
  Page<Pharmacy> findByUnsettledAndRegionAndPharmacyName(
      @Param("unsettled") Boolean unsettled,
      @Param("region") Region region,
      @Param("keyword") String keyword,
      Pageable pageable
  );

  @Query("""
      SELECT p.pharmacyId AS pharmacyId, MAX(b.createdAt) AS latestSettlementAt
      FROM Pharmacy p
      LEFT JOIN BalanceTx b ON p.pharmacyId = b.pharmacy.pharmacyId AND b.type = :type
      WHERE p.pharmacyId IN :pharmacyIds
      GROUP BY p.pharmacyId
      """)
  List<PharmacyLatestSettlementProjection> findLatestSettlementDatesByPharmacyIds(
      @Param("pharmacyIds") List<Long> pharmacyIds,
      @Param("type") BalanceTxType type
  );

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Pharmacy p
      SET p.balance = p.balance + :amount
      WHERE p.pharmacyId = :pharmacyId AND p.balance + :amount <= 10000000
      """)
  int increaseBalance(
      @Param("pharmacyId") Long pharmacyId,
      @Param("amount") BigDecimal amount
  );

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Pharmacy p
      SET p.balance = p.balance - :amount
      WHERE p.pharmacyId = :pharmacyId
      """)
  int decreaseBalance(
      @Param("pharmacyId") Long pharmacyId,
      @Param("amount") BigDecimal amount
  );

  interface PharmacyLatestSettlementProjection {

    Long getPharmacyId();

    LocalDateTime getLatestSettlementAt();
  }
}
