package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.InventoryHistory;
import com.yeahyak.backend.entity.enums.InventoryDivision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    @Query("SELECT i FROM InventoryHistory i " +
            "WHERE (:startDate IS NULL OR i.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR i.createdAt <= :endDate) " +
            "AND (:division IS NULL OR i.division = :division)")
    Page<InventoryHistory> findAllWithFilters(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("division") InventoryDivision division,
            Pageable pageable
    );
}
