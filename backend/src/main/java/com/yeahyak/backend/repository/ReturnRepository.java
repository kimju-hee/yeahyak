package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Returns;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReturnRepository extends JpaRepository<Returns, Long> {
    Page<Returns> findByStatus(ReturnStatus status, Pageable pageable);

    Page<Returns> findByPharmacy_PharmacyNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Returns> findByStatusAndPharmacy_PharmacyNameContainingIgnoreCase(ReturnStatus status, String name, Pageable pageable);

    Page<Returns> findByPharmacy_PharmacyId(Long pharmacyId, Pageable pageable);

    Page<Returns> findByPharmacy_PharmacyIdAndStatus(Long pharmacyId, ReturnStatus status, Pageable pageable);
}
