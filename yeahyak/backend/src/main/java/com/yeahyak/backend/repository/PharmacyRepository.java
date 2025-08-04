package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.Status;
import com.yeahyak.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
    boolean existsByPharmacyName(String pharmacyName);
    boolean existsByBizRegNo(String bizRegNo);
    List<Pharmacy> findByStatus(Status status);
    Optional<Pharmacy> findByUser(User user);
}
