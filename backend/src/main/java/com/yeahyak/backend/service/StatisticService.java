package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.BranchStatisticsDto;
import com.yeahyak.backend.dto.DrugStatDto;
import com.yeahyak.backend.dto.OrderSummaryDto;
import com.yeahyak.backend.entity.Order;
import com.yeahyak.backend.entity.OrderItems;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.repository.OrderItemRepository;
import com.yeahyak.backend.repository.OrderRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticService {

    private final PharmacyRepository pharmacyRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public BranchStatisticsDto getBranchStatistics(Long pharmacyId, LocalDate start, LocalDate end) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다."));

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(23, 59, 59);

        List<Order> orders = orderRepository.findByPharmacy_PharmacyIdAndCreatedAtBetween(pharmacyId, startDateTime, endDateTime);
        List<OrderItems> items = orderItemRepository.findByOrdersIn(orders);

        int totalOrderCount = orders.size();
        BigDecimal totalOrderAmount = orders.stream()
                .map(o -> BigDecimal.valueOf(o.getTotalPrice() != null ? o.getTotalPrice() : 0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, DrugStatDto> drugMap = new HashMap<>();
        for (OrderItems item : items) {
            Long productId = item.getProduct().getProductId();
            DrugStatDto stat = drugMap.getOrDefault(productId,
                    new DrugStatDto(productId, item.getProduct().getProductName(), 0L, BigDecimal.ZERO));

            stat.setQuantity(stat.getQuantity() + item.getQuantity());
            stat.setTotalPrice(stat.getTotalPrice().add(BigDecimal.valueOf(item.getSubtotalPrice())));
            drugMap.put(productId, stat);
        }

        return BranchStatisticsDto.builder()
                .storeId(pharmacyId)
                .storeName(pharmacy.getPharmacyName())
                .period(new BranchStatisticsDto.Period(start, end))
                .orderSummary(OrderSummaryDto.builder()
                        .totalOrderCount(totalOrderCount)
                        .totalOrderAmount(totalOrderAmount)
                        .build())
                .orderedDrugs(new ArrayList<>(drugMap.values()))
                .build();
    }
}
