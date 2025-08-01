package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Order;
import com.yeahyak.backend.entity.OrderItems;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByPharmacy_PharmacyIdAndCreatedAtBetween(Long pharmacyId, LocalDateTime start, LocalDateTime end);
}
