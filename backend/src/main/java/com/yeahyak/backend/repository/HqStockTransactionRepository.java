package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.HqStockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HqStockTransactionRepository extends JpaRepository<HqStockTransaction, Long> {
    List<HqStockTransaction> findByHqStock_IdOrderByCreatedAtDescIdDesc(Long stockId);
}
