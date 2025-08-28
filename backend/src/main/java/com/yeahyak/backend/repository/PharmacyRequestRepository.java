package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.PharmacyRequest;
import com.yeahyak.backend.entity.enums.PharmacyRequestStatus;
import com.yeahyak.backend.entity.enums.Region;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyRequestRepository extends JpaRepository<PharmacyRequest, Long> {

  boolean existsByUser_UserId(Long userId);

  Optional<PharmacyRequest> findByUser_UserId(Long userId);

  boolean existsByBizRegNo(String bizRegNo);

  @Query("""
      SELECT r FROM PharmacyRequest r
      WHERE (:status IS NULL OR r.status = :status)
      AND (:region IS NULL OR r.region = :region)
      AND (:keyword IS NULL OR  r.pharmacyName LIKE CONCAT('%', :keyword, '%'))
      ORDER BY r.requestedAt DESC
      """)
  Page<PharmacyRequest> findByStatusAndRegionAndPharmacyName(
      @Param("status") PharmacyRequestStatus status,
      @Param("region") Region region,
      @Param("keyword") String keyword,
      Pageable pageable
  );
}
