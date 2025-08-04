package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.PharmacyRegistrationRequest;
import com.yeahyak.backend.entity.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PharmacyRegistrationRequestRepository extends JpaRepository<PharmacyRegistrationRequest, Long> {
    Page<PharmacyRegistrationRequest> findByStatus(Status status, Pageable pageable);
    Optional<PharmacyRegistrationRequest> findByPharmacy(Pharmacy pharmacy);
}
