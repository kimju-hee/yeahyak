package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Order;
import com.yeahyak.backend.entity.OrderItems;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItems, Long> {
    List<OrderItems> findByOrders(Order order);
    List<OrderItems> findByOrdersIn(List<Order> orders);
}
