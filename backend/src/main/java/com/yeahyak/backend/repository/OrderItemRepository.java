package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.OrderItem;
import com.yeahyak.backend.entity.Orders;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

  List<OrderItem> findByOrders(Orders orders);

  void deleteAllByOrders(Orders orders);
}
