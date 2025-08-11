package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.HqStockDto;
import com.yeahyak.backend.dto.HqStockTxDto;
import com.yeahyak.backend.entity.HqStock;
import com.yeahyak.backend.entity.HqStockTransaction;
import com.yeahyak.backend.entity.enums.HqTransactionType;
import com.yeahyak.backend.repository.HqStockRepository;
import com.yeahyak.backend.repository.HqStockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HqStockServiceImpl implements HqStockService {

    private final HqStockRepository stockRepo;
    private final HqStockTransactionRepository txRepo;

    private static final DateTimeFormatter D = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public Page<HqStockDto> list(String search, int page, int size) {
        Page<Object[]> p = stockRepo.search(
                (search == null || search.isBlank()) ? null : search,
                PageRequest.of(page, size)
        );
        List<HqStockDto> items = p.getContent().stream().map(r -> HqStockDto.builder()
                .stockId(((Number) r[0]).longValue())
                .productId(((Number) r[1]).longValue())
                .productCode((String) r[2])
                .productName((String) r[3])
                .unit((String) r[4])
                .quantity(((Number) r[5]).intValue())
                .lastInboundDate((String) r[6])
                .lastOutboundDate((String) r[7])
                .build()
        ).collect(Collectors.toList());

        return new PageImpl<>(items, p.getPageable(), p.getTotalElements());
    }

    @Override
    public List<HqStockTxDto> transactions(Long stockId) {
        HqStock stock = stockRepo.findById(stockId).orElseThrow();
        List<HqStockTransaction> txs = txRepo.findByHqStock_IdOrderByCreatedAtDescIdDesc(stockId);

        int balance = Optional.ofNullable(stock.getQuantity()).orElse(0);
        List<HqStockTxDto> rows = new ArrayList<>();

        for (HqStockTransaction tx : txs) {
            String typeLabel = switch (tx.getType()) {
                case IN -> "입고";
                case RETURN_IN -> "반품입고";
                case OUT -> "출고";
            };

            String remark = "-";
            // 필요 시 orderId/returnId로 약국명 lookup 하려면 여기서 repository 추가 조회하면 됨.

            rows.add(HqStockTxDto.builder()
                    .id(tx.getId())
                    .date(tx.getCreatedAt().toLocalDate().format(D))
                    .type(typeLabel)
                    .quantity(tx.getQuantity())
                    .balance(balance)
                    .remark(remark)
                    .build());

            // 역산
            if (tx.getType() == HqTransactionType.IN || tx.getType() == HqTransactionType.RETURN_IN) {
                balance -= tx.getQuantity();
            } else { // OUT
                balance += tx.getQuantity();
            }
        }
        Collections.reverse(rows);
        return rows;
    }
}
