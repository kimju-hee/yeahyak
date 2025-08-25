package com.yeahyak.backend.deprecated;

import com.yeahyak.backend.entity.enums.StockTxType;
import com.yeahyak.backend.repository.StockTxRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryHistoryService {

  private final StockTxRepository stockTxRepository;

  @Transactional
  public Map<String, Object> getHistories(LocalDate startDate, LocalDate endDate,
      StockTxType division, Long productId, int page, int size) { // ✅ productId 추가
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

    Page<InventoryHistory> histories = stockTxRepository.findAllWithFilters(
        startDate != null ? startDate.atStartOfDay() : null,
        endDate != null ? endDate.atTime(23, 59, 59) : null,
        division,
        productId, // ✅ 전달
        pageable
    );

    List<Map<String, Object>> data = histories.getContent().stream()
        .map(h -> {
          Map<String, Object> map = new HashMap<>();
          map.put("date", h.getCreatedAt());
          map.put("division", h.getDivision());
          map.put("quantity", h.getQuantity());
          map.put("stock", h.getStock());
          map.put("note", h.getNote());
          return map;
        })
        .toList();

    return Map.of(
        "success", true,
        "data", data,
        "totalPages", histories.getTotalPages(),
        "totalElements", histories.getTotalElements(),
        "currentPage", histories.getNumber()
    );
  }
}
