package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.PharmacyRegistrationRequest;
import com.yeahyak.backend.entity.enums.Status;
import com.yeahyak.backend.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PharmacyRegistrationRequestRepository extends JpaRepository<PharmacyRegistrationRequest, Long> {
    Page<PharmacyRegistrationRequest> findByStatus(Status status, Pageable pageable);
    Optional<PharmacyRegistrationRequest> findByPharmacy(Pharmacy pharmacy);

    @Query("SELECT r FROM PharmacyRegistrationRequest r WHERE r.pharmacy.user.userRole = :role")
    Page<PharmacyRegistrationRequest> findByUserRole(@Param("role") UserRole role, Pageable pageable);
}
