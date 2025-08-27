package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.enums.Region;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {

  boolean existsByUser_UserId(Long userId);

  Optional<Pharmacy> findByUser_UserId(Long userId);

  boolean existsByBizRegNo(String bizRegNo);

  @Query("""
      SELECT p FROM Pharmacy p
      WHERE (:unsettled = FALSE OR p.outstandingBalance > 0)
      AND (:region IS NULL OR p.region = :region)
      AND (:keyword IS NULL OR p.pharmacyName LIKE CONCAT('%', :keyword, '%'))
      """)
  Page<Pharmacy> findByUnsettledAndRegionAndPharmacyName(
      @Param("unsettled") Boolean unsettled,
      @Param("region") Region region,
      @Param("keyword") String keyword,
      Pageable pageable
  );
}
