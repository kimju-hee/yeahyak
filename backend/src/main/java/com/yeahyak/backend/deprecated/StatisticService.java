package com.yeahyak.backend.deprecated;

import com.yeahyak.backend.entity.OrderItem;
import com.yeahyak.backend.entity.Orders;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.repository.OrderItemRepository;
import com.yeahyak.backend.repository.OrderRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatisticService {

  private final PharmacyRepository pharmacyRepository;
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;

  public BranchStatisticsDTO getBranchStatistics(Long pharmacyId, LocalDate start, LocalDate end) {
    Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
        .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다."));

    LocalDateTime startDateTime = start.atStartOfDay();
    LocalDateTime endDateTime = end.atTime(23, 59, 59);

    List<Orders> orders = orderRepository.findByPharmacy_PharmacyIdAndCreatedAtBetween(pharmacyId,
        startDateTime, endDateTime);
    List<OrderItem> items = orderItemRepository.findByOrdersIn(orders);

    int totalOrderCount = orders.size();
    BigDecimal totalOrderAmount = orders.stream()
        .map(o -> BigDecimal.valueOf(o.getTotalPrice() != null ? o.getTotalPrice() : 0))
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    Map<Long, DrugStatDTO> drugMap = new HashMap<>();
    for (OrderItem item : items) {
      Long productId = item.getProduct().getProductId();
      DrugStatDTO stat = drugMap.getOrDefault(productId,
          new DrugStatDTO(productId, item.getProduct().getProductName(), 0L, BigDecimal.ZERO));

      stat.setQuantity(stat.getQuantity() + item.getQuantity());
      stat.setTotalPrice(stat.getTotalPrice().add(BigDecimal.valueOf(item.getSubtotalPrice())));
      drugMap.put(productId, stat);
    }

    return BranchStatisticsDTO.builder()
        .storeId(pharmacyId)
        .storeName(pharmacy.getPharmacyName())
        .period(new BranchStatisticsDTO.Period(start, end))
        .orderSummary(OrderSummaryDTO.builder()
            .totalOrderCount(totalOrderCount)
            .totalOrderAmount(totalOrderAmount)
            .build())
        .orderedDrugs(new ArrayList<>(drugMap.values()))
        .build();
  }
}
