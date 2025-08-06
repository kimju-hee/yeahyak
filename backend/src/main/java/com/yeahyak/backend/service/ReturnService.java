package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ReturnItemResponseDto;
import com.yeahyak.backend.dto.ReturnRequestDto;
import com.yeahyak.backend.dto.ReturnResponseDto;
import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import com.yeahyak.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final ReturnItemsRepository returnItemsRepository;
    private final PharmacyRepository pharmacyRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public ReturnResponseDto createReturnRequest(ReturnRequestDto dto) {
        Pharmacy pharmacy = pharmacyRepository.findById(dto.getPharmacyId())
                .orElseThrow(() -> new RuntimeException("약국 정보 없음"));

        List<Product> orderedProducts = new ArrayList<>();
        if (dto.getOrderId() != null) {
            Order order = orderRepository.findById(dto.getOrderId())
                    .orElseThrow(() -> new RuntimeException("주문 정보 없음"));

            if (!order.getPharmacy().getPharmacyId().equals(dto.getPharmacyId())) {
                throw new RuntimeException("해당 약국의 주문이 아닙니다.");
            }

            List<OrderItems> orderItems = orderItemRepository.findByOrders(order);
            orderedProducts = orderItems.stream()
                    .map(OrderItems::getProduct)
                    .toList();
        }

        Returns returns = new Returns();
        returns.setPharmacy(pharmacy);
        returns.setCreatedAt(LocalDateTime.now());
        returns.setReason(dto.getReason());
        returns.setStatus(ReturnStatus.REQUESTED);
        returns.setUpdatedAt(null);

        List<ReturnItems> returnItemList = new ArrayList<>();
        List<ReturnItemResponseDto> itemResponses = new ArrayList<>();
        int total = 0;

        for (ReturnRequestDto.ReturnItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("제품 없음"));

            if (dto.getOrderId() != null && orderedProducts.stream().noneMatch(p -> p.getProductId().equals(product.getProductId()))) {
                throw new RuntimeException("해당 주문에 포함되지 않은 상품입니다: " + product.getProductName());
            }

            int subtotal = itemDto.getQuantity() * itemDto.getUnitPrice();
            total += subtotal;

            ReturnItems item = new ReturnItems();
            item.setReturns(returns);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            item.setSubtotalPrice(subtotal);
            returnItemList.add(item);

            itemResponses.add(ReturnItemResponseDto.builder()
                    .productName(product.getProductName())
                    .reason(dto.getReason())
                    .quantity(itemDto.getQuantity())
                    .unitPrice(itemDto.getUnitPrice())
                    .subtotalPrice(subtotal)
                    .build());
        }

        returns.setTotalPrice(total);
        returnRepository.save(returns);
        returnItemsRepository.saveAll(returnItemList);

        return ReturnResponseDto.builder()
                .returnId(returns.getReturnId())
                .pharmacyName(pharmacy.getPharmacyName())
                .orderId(dto.getOrderId())
                .createdAt(returns.getCreatedAt())
                .totalPrice(total)
                .status(returns.getStatus().name())
                .items(itemResponses)
                .build();
    }
    @Transactional
    public Map<String, Object> getAllReturns(int page, int size, String status, String pharmacyName) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Returns> returnsPage;
        if (status != null && pharmacyName != null) {
            returnsPage = returnRepository.findByStatusAndPharmacy_PharmacyNameContainingIgnoreCase(
                    ReturnStatus.valueOf(status), pharmacyName, pageable);
        } else if (status != null) {
            returnsPage = returnRepository.findByStatus(ReturnStatus.valueOf(status), pageable);
        } else if (pharmacyName != null) {
            returnsPage = returnRepository.findByPharmacy_PharmacyNameContainingIgnoreCase(pharmacyName, pageable);
        } else {
            returnsPage = returnRepository.findAll(pageable);
        }

        return convertToPagedReturnResponse(returnsPage);
    }

    @Transactional
    public Map<String, Object> getReturnsByPharmacy(Long pharmacyId, int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Returns> returnsPage;
        if (status != null) {
            returnsPage = returnRepository.findByPharmacy_PharmacyIdAndStatus(
                    pharmacyId, ReturnStatus.valueOf(status), pageable);
        } else {
            returnsPage = returnRepository.findByPharmacy_PharmacyId(pharmacyId, pageable);
        }

        return convertToPagedReturnResponse(returnsPage);
    }

    private Map<String, Object> convertToPagedReturnResponse(Page<Returns> returnsPage) {
        List<ReturnResponseDto> returnResponses = returnsPage.getContent().stream().map(ret -> {
            List<ReturnItems> items = returnItemsRepository.findByReturns(ret);

            List<ReturnItemResponseDto> itemDtos = items.stream().map(item ->
                    ReturnItemResponseDto.builder()
                            .productName(item.getProduct().getProductName())
                            .reason(ret.getReason())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotalPrice(item.getSubtotalPrice())
                            .build()
            ).toList();

            return ReturnResponseDto.builder()
                    .returnId(ret.getReturnId())
                    .pharmacyId(ret.getPharmacy().getPharmacyId())
                    .pharmacyName(ret.getPharmacy().getPharmacyName())
                    .orderId(null)
                    .createdAt(ret.getCreatedAt())
                    .totalPrice(ret.getTotalPrice())
                    .status(ret.getStatus().name())
                    .items(itemDtos)
                    .build();
        }).toList();

        return Map.of(
                "success", true,
                "data", returnResponses,
                "totalPages", returnsPage.getTotalPages(),
                "totalElements", returnsPage.getTotalElements(),
                "currentPage", returnsPage.getNumber()
        );
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
