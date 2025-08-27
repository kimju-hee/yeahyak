package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Orders;
import com.yeahyak.backend.entity.ReturnItem;
import com.yeahyak.backend.entity.Returns;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReturnItemRepository extends JpaRepository<ReturnItem, Long> {

  @Query("""
      SELECT COALESCE(SUM(ri.quantity), 0) FROM ReturnItem ri
      WHERE ri.returns.orders = :orders
      AND ri.product.productId = :productId
      AND ri.returns.status IN (:statuses)
      """)
  long sumReturnedQtyForOrderAndProduct(
      @Param("orders") Orders orders,
      @Param("productId") Long productId,
      @Param("statuses") Collection<ReturnStatus> statuses
  );

  List<ReturnItem> findByReturns(Returns returns);

  void deleteAllByReturns(Returns returns);
}
