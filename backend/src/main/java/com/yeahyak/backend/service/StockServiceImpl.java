package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.entity.enums.MainCategory;
import com.yeahyak.backend.entity.enums.SubCategory;
import com.yeahyak.backend.entity.enums.TransactionType;
import com.yeahyak.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final PharmacyRepository pharmacyRepository;
    private final ProductRepository productRepository;
    private final PharmacyStockRepository pharmacyStockRepository;
    private final PharmacyStockTransactionRepository pharmacyStockTransactionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StockSummaryDTO> getStockSummary(Long pharmacyId, MainCategory mainCategory, SubCategory subCategory, String keyword) {
        List<PharmacyStock> stockList = pharmacyStockRepository.findFilteredStocks(pharmacyId, mainCategory, subCategory, keyword);
        return stockList.stream().map(stock -> {
            String status;
            if (stock.getQuantity() <= 0) status = "위험";
            else if (stock.getQuantity() <= 3) status = "경고";
            else status = "적정";
            return StockSummaryDTO.builder()
                    .productName(stock.getProduct().getProductName())
                    .mainCategory(stock.getProduct().getMainCategory().name())
                    .subCategory(stock.getProduct().getSubCategory().name())
                    .quantity(stock.getQuantity())
                    .lastInboundDate(stock.getLastInboundedAt())
                    .lastOutboundDate(stock.getLastOutboundAt())
                    .status(status)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateStock(Long pharmacyId, StockUpdateRequest request) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId).orElseThrow();
        Product product = productRepository.findById(request.getProductId()).orElseThrow();

        PharmacyStock stock = pharmacyStockRepository.findByPharmacyAndProduct(pharmacy, product)
                .orElseGet(() -> PharmacyStock.builder()
                        .pharmacy(pharmacy)
                        .product(product)
                        .quantity(0)
                        .build());

        int updatedQuantity = stock.getQuantity() +
                (request.getTransactionType() == TransactionType.INBOUND ? request.getQuantityChange() : -request.getQuantityChange());
        stock.setQuantity(Math.max(0, updatedQuantity));

        LocalDateTime now = LocalDateTime.now();
        if (request.getTransactionType() == TransactionType.INBOUND) {
            stock.setLastInboundedAt(now);
        } else {
            stock.setLastOutboundAt(now);
        }

        pharmacyStockRepository.save(stock);

        PharmacyStockTransaction transaction = PharmacyStockTransaction.builder()
                .pharmacy(pharmacy)
                .product(product)
                .quantity(request.getQuantityChange())
                .transactionType(request.getTransactionType())
                .transactionDate(now)
                .build();

        pharmacyStockTransactionRepository.save(transaction);  // 🔧 FIXED
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockTransactionDTO> getStockTransactions(Long pharmacyId, Long productId) {
        return pharmacyStockTransactionRepository.findTransactions(pharmacyId, productId);  // 🔧 FIXED
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockStatisticsDTO> getStockStatistics(Long pharmacyId, LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.plusDays(1).atStartOfDay().minusSeconds(1);

        List<Object[]> rawResults = pharmacyStockTransactionRepository.findStatisticsNative(pharmacyId, fromDateTime, toDateTime);  // 🔧 FIXED

        return rawResults.stream()
                .map(row -> new StockStatisticsDTO(
                        (String) row[0],
                        TransactionType.valueOf((String) row[1]),
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockSummaryDTO> getStockSummary(Long pharmacyId, MainCategory mainCategory, SubCategory subCategory, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastInboundedAt"));
        Page<PharmacyStock> stockPage = pharmacyStockRepository.findFilteredStocks(pharmacyId, mainCategory, subCategory, keyword, pageable);
        return stockPage.map(stock -> {
            String status;
            if (stock.getQuantity() <= 0) status = "위험";
            else if (stock.getQuantity() <= 3) status = "경고";
            else status = "적정";

            return StockSummaryDTO.builder()
                    .productName(stock.getProduct().getProductName())
                    .mainCategory(stock.getProduct().getMainCategory().name())
                    .subCategory(stock.getProduct().getSubCategory().name())
                    .quantity(stock.getQuantity())
                    .lastInboundDate(stock.getLastInboundedAt())
                    .lastOutboundDate(stock.getLastOutboundAt())
                    .status(status)
                    .build();
        });
    }

    @Override
    public Page<StockTransactionDTO> getProductStockHistory(Long pharmacyId, Long productId, LocalDate startDate, LocalDate endDate, int page, int size) {
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;

        Page<PharmacyStockTransaction> history = pharmacyStockTransactionRepository.findByPharmacyAndProductAndDateRange(
                pharmacyId, productId, startDateTime, endDateTime, PageRequest.of(page, size)
        );

        return history.map(tx -> new StockTransactionDTO(
                tx.getProduct().getProductName(),
                tx.getTransactionType(),
                tx.getQuantity(),
                tx.getTransactionDate()
        ));
    }
}
