package com.yeahyak.backend.repository;

import com.yeahyak.backend.dto.BranchStatisticsDto;
import com.yeahyak.backend.dto.DrugStatDto;
import com.yeahyak.backend.dto.OrderSummaryDto;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class StatisticRepositoryImpl implements StatisticRepositoryCustom {
    private final EntityManager em;

    @Override
    public BranchStatisticsDto getBranchStatistics(Long storeId, LocalDate start, LocalDate end) {

        // ✅ 1. 약국 이름 조회 - 필드명 수정
        String storeName = em.createQuery(
                        "SELECT p.pharmacyName FROM Pharmacy p WHERE p.pharmacyId = :id", String.class)
                .setParameter("id", storeId)
                .getSingleResult();

        // 2. 주문 수 & 총금액
        Object[] orderSummary = em.createQuery(
                        "SELECT COUNT(o), COALESCE(SUM(o.totalPrice), 0) " +
                                "FROM Order o WHERE o.pharmacy.pharmacyId = :id AND o.createdAt BETWEEN :start AND :end", Object[].class)
                .setParameter("id", storeId)
                .setParameter("start", start.atStartOfDay())
                .setParameter("end", end.atTime(23, 59, 59))
                .getSingleResult();

        // 3. 의약품별 주문 정보
        List<DrugStatDto> drugs = em.createQuery(
                        "SELECT new com.yeahyak.backend.dto.DrugStatDto(p.productId, p.name, SUM(oi.quantity), SUM(oi.price)) " +
                                "FROM OrderItem oi " +
                                "JOIN oi.order o " +
                                "JOIN oi.product p " +
                                "WHERE o.pharmacy.pharmacyId = :id AND o.createdAt BETWEEN :start AND :end " +
                                "GROUP BY p.productId, p.name", DrugStatDto.class)
                .setParameter("id", storeId)
                .setParameter("start", start.atStartOfDay())
                .setParameter("end", end.atTime(23, 59, 59))
                .getResultList();

        return BranchStatisticsDto.builder()
                .storeId(storeId)
                .storeName(storeName)
                .period(new BranchStatisticsDto.Period(start, end))
                .orderSummary(OrderSummaryDto.builder()
                        .totalOrderCount(((Long) orderSummary[0]).intValue())
                        .totalOrderAmount((BigDecimal) orderSummary[1])
                        .build())
                .orderedDrugs(drugs)
                .build();
    }
}
