package com.yeahyak.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.yeahyak.backend.entity.CreditSettlement;
import com.yeahyak.backend.entity.User;

public interface CreditSettlementRepository extends JpaRepository<CreditSettlement, Long> {
    List<CreditSettlement> findByUser(User user);

    @Query("SELECT c FROM CreditSettlement c WHERE c.user = :user ORDER BY c.settledAt DESC")
    List<CreditSettlement> findRecentByUser(User user);

    @Query("SELECT SUM(c.amount) FROM CreditSettlement c WHERE c.user = :user")
    Integer sumAmountByUser(User user);
}