package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.OrderItemRequest;
import com.yeahyak.backend.dto.OrderItemResponse;
import com.yeahyak.backend.dto.OrderRequest;
import com.yeahyak.backend.dto.OrderResponse;
import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.entity.enums.CreditStatus;
import com.yeahyak.backend.entity.enums.OrderStatus;
import com.yeahyak.backend.entity.enums.Status;
import com.yeahyak.backend.repository.OrderItemRepository;
import com.yeahyak.backend.repository.OrderRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.ProductRepository;
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
public class OrderService {

    private final PharmacyRepository pharmacyRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Pharmacy pharmacy = pharmacyRepository.findById(request.getPharmacyId())
                .orElseThrow(() -> new IllegalArgumentException("약국이 존재하지 않습니다."));
        if (pharmacy.getStatus() != Status.ACTIVE) throw new IllegalStateException("승인된 약국만 발주를 생성할 수 있습니다.");

        int totalPrice = 0;
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 제품이 존재하지 않습니다."));
            int subtotal = itemRequest.getQuantity() * itemRequest.getUnitPrice();
            totalPrice += subtotal;
            itemResponses.add(OrderItemResponse.builder()
                    .productName(product.getProductName())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .subtotalPrice(subtotal)
                    .build());
        }

        User owner = pharmacy.getUser();
        long next = owner.getPoint() - totalPrice;
        if (next < -1000000) throw new IllegalStateException("CREDIT_LIMIT_EXCEEDED");
        owner.setPoint((int) next);

        Order orders = Order.builder()
                .pharmacy(pharmacy)
                .status(OrderStatus.REQUESTED)
                .createdAt(LocalDateTime.now())
                .build();
        orderRepository.save(orders);

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId()).orElseThrow();
            int subtotal = itemRequest.getQuantity() * itemRequest.getUnitPrice();
            OrderItems orderItem = OrderItems.builder()
                    .orders(orders)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .subtotalPrice(subtotal)
                    .build();
            orderItemRepository.save(orderItem);
        }

        orders.setTotalPrice(totalPrice);

        if (next < 0 && orderRepository.existsByPharmacy(pharmacy)) {
            owner.setCreditStatus(CreditStatus.SETTLEMENT_REQUIRED);
        }

        return OrderResponse.builder()
                .orderId(orders.getOrderId())
                .pharmacyName(pharmacy.getPharmacyName())
                .createdAt(orders.getCreatedAt())
                .totalPrice(totalPrice)
                .status(orders.getStatus().name())
                .items(itemResponses)
                .build();
    }

    @Transactional
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();

        return orders.stream().map(order -> {
            List<OrderItems> items = orderItemRepository.findByOrders(order);

            List<OrderItemResponse> itemResponses = items.stream().map(item ->
                    OrderItemResponse.builder()
                            .productName(item.getProduct().getProductName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotalPrice(item.getSubtotalPrice())
                            .build()
            ).toList();

            return OrderResponse.builder()
                    .orderId(order.getOrderId())
                    .pharmacyName(order.getPharmacy().getPharmacyName())
                    .createdAt(order.getCreatedAt())
                    .totalPrice(order.getTotalPrice())
                    .status(order.getStatus().name())
                    .items(itemResponses)
                    .build();
        }).toList();
    }

    public Map<String, Object> getAllOrders(int page, int size, OrderStatus status, String pharmacyName) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findAllWithFilters(status, pharmacyName, pageable);
        return convertToPagedResponse(orders);
    }

    public Map<String, Object> getOrdersByPharmacy(Long pharmacyId, int page, int size, OrderStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findByPharmacyAndOptionalStatus(pharmacyId, status, pageable);
        return convertToPagedResponse(orders);
    }

    private Map<String, Object> convertToPagedResponse(Page<Order> orders) {
        List<OrderResponse> orderResponses = orders.getContent().stream().map(order -> {
            List<OrderItems> items = orderItemRepository.findByOrders(order);
            List<OrderItemResponse> itemResponses = items.stream().map(item ->
                    OrderItemResponse.builder()
                            .productName(item.getProduct().getProductName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotalPrice(item.getSubtotalPrice())
                            .build()
            ).toList();

            return OrderResponse.builder()
                    .orderId(order.getOrderId())
                    .pharmacyId(order.getPharmacy().getPharmacyId())
                    .pharmacyName(order.getPharmacy().getPharmacyName())
                    .createdAt(order.getCreatedAt())
                    .totalPrice(order.getTotalPrice())
                    .status(order.getStatus().name())
                    .updatedAt(order.getUpdatedAt())
                    .items(itemResponses)
                    .build();
        }).toList();

        return Map.of(
                "success", true,
                "data", orderResponses,
                "totalPages", orders.getTotalPages(),
                "totalElements", orders.getTotalElements(),
                "currentPage", orders.getNumber()
        );
    }

    public OrderResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 존재하지 않습니다."));

        Pharmacy pharmacy = order.getPharmacy();
        List<OrderItems> items = orderItemRepository.findByOrders(order);

        List<OrderItemResponse> itemResponses = items.stream().map(item ->
                OrderItemResponse.builder()
                        .productId(item.getProduct().getProductId())
                        .productName(item.getProduct().getProductName())
                        .manufacturer(item.getProduct().getManufacturer())
                        .mainCategory(item.getProduct().getMainCategory().name())
                        .subCategory(item.getProduct().getSubCategory().name())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotalPrice(item.getSubtotalPrice())
                        .build()
        ).toList();

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .pharmacyId(pharmacy.getPharmacyId())
                .pharmacyName(pharmacy.getPharmacyName())
                .createdAt(order.getCreatedAt())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().name())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }

    @Transactional
    public void approveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 존재하지 않습니다."));
        order.setStatus(OrderStatus.APPROVED);
        order.setUpdatedAt(LocalDateTime.now());
    }


    @Transactional
    public void rejectOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 존재하지 않습니다."));
        User owner = order.getPharmacy().getUser();
        int total = order.getTotalPrice();
        owner.setPoint(owner.getPoint() + total);
        if (owner.getPoint() >= 0) owner.setCreditStatus(CreditStatus.FULL);
        order.setStatus(OrderStatus.REJECTED);
        order.setUpdatedAt(LocalDateTime.now());
    }

    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 존재하지 않습니다."));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("올바르지 않은 상태값입니다: " + status);
        }
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 존재하지 않습니다."));

        List<OrderItems> items = orderItemRepository.findByOrders(order);
        orderItemRepository.deleteAll(items);

        orderRepository.delete(order);
    }
}
