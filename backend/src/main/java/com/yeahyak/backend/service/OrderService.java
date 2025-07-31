package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.OrderItemRequest;
import com.yeahyak.backend.dto.OrderItemResponse;
import com.yeahyak.backend.dto.OrderRequest;
import com.yeahyak.backend.dto.OrderResponse;
import com.yeahyak.backend.entity.OrderItems;
import com.yeahyak.backend.entity.Order;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.repository.OrderItemRepository;
import com.yeahyak.backend.repository.OrderRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PharmacyRepository pharmacyRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public void createOrder(OrderRequest request) {
        Pharmacy pharmacy = pharmacyRepository.findById(request.getPharmacyId())
                .orElseThrow(() -> new IllegalArgumentException("약국이 존재하지 않습니다."));

        Order orders = Order.builder()
                .pharmacy(pharmacy)
                .status("REQUESTED")
                .createdAt(LocalDateTime.now())
                .build();

        orderRepository.save(orders);

        int totalPrice = 0;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 제품이 존재하지 않습니다."));

            int subtotal = itemRequest.getQuantity() * itemRequest.getUnitPrice();
            totalPrice += subtotal;

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
                    .status(order.getStatus())
                    .items(itemResponses)
                    .build();
        }).toList();
    }

}