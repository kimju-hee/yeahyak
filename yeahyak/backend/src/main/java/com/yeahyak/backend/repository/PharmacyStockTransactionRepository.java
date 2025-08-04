package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.dto.StockStatisticsDTO;
import com.yeahyak.backend.dto.StockTransactionDTO;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PharmacyStockTransactionRepository extends JpaRepository<PharmacyStockTransaction, Long> {

    @Query("SELECT new com.yeahyak.backend.dto.StockTransactionDTO(p.productName, t.transactionType, t.quantity, t.transactionDate) " +
            "FROM PharmacyStockTransaction t JOIN t.product p WHERE t.pharmacy.pharmacyId = :pharmacyId AND (:productId IS NULL OR p.productId = :productId)")
    List<StockTransactionDTO> findTransactions(Long pharmacyId, Long productId);

    @Query(value = "SELECT DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS date, t.transaction_type AS transactionType, SUM(t.quantity) AS totalQuantity " +
            "FROM pharmacy_stock_transactions t " +
            "WHERE t.pharmacy_id = :pharmacyId AND t.transaction_date BETWEEN :from AND :to " +
            "GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m-%d'), t.transaction_type", nativeQuery = true)
    List<Object[]> findStatisticsNative(@Param("pharmacyId") Long pharmacyId,
                                        @Param("from") LocalDateTime from,
                                        @Param("to") LocalDateTime to);
}