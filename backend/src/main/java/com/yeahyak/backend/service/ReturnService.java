package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ReturnRequestDto;
import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.ProductRepository;
import com.yeahyak.backend.repository.ReturnItemsRepository;
import com.yeahyak.backend.repository.ReturnRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final ReturnItemsRepository returnItemsRepository;
    private final PharmacyRepository pharmacyRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void createReturnRequest(ReturnRequestDto dto) {
        Pharmacy pharmacy = pharmacyRepository.findById(dto.getPharmacyId())
                .orElseThrow(() -> new RuntimeException("약국 정보 없음"));

        Returns returns = new Returns();
        returns.setPharmacy(pharmacy);
        returns.setCreatedAt(LocalDateTime.now());
        returns.setReason(dto.getReason());
        returns.setStatus(ReturnStatus.REQUESTED);
        returns.setUpdatedAt(null);

        List<ReturnItems> returnItemList = new ArrayList<>();
        int total = 0;

        for (ReturnRequestDto.ReturnItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("제품 없음"));

            int subtotal = itemDto.getQuantity() * itemDto.getUnitPrice();
            total += subtotal;

            ReturnItems item = new ReturnItems();
            item.setReturns(returns);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            item.setSubtotalPrice(subtotal);
            returnItemList.add(item);
        }

        returns.setTotalPrice(total);
        returnRepository.save(returns);
        returnItemsRepository.saveAll(returnItemList);
    }

    @Transactional
    public void updateStatus(Long returnId, ReturnStatus status) {
        Returns returns = returnRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("반품 정보 없음"));

        if (returns.getStatus() == ReturnStatus.REJECTED || returns.getStatus() == ReturnStatus.COMPLETED) {
            throw new RuntimeException("이미 처리된 반품입니다.");
        }

        returns.setStatus(status);
        returns.setUpdatedAt(LocalDateTime.now());
    }

}
