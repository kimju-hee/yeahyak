package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.OrderCreateRequest;
import com.yeahyak.backend.dto.OrderCreateResponse;
import com.yeahyak.backend.dto.OrderDetailResponse;
import com.yeahyak.backend.dto.OrderListResponse;
import com.yeahyak.backend.dto.OrderUpdateRequest;
import com.yeahyak.backend.entity.OrderItem;
import com.yeahyak.backend.entity.Orders;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import com.yeahyak.backend.entity.enums.InventoryTxType;
import com.yeahyak.backend.entity.enums.OrderStatus;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.repository.OrderItemRepository;
import com.yeahyak.backend.repository.OrderRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 발주 요청과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final PharmacyRepository pharmacyRepository;
  private final ProductRepository productRepository;
  private final BalanceTxService balanceTxService;
  private final InventoryTxService inventoryTxService;

  /**
   * 발주 요청을 생성합니다.
   */
  @Transactional
  public OrderCreateResponse createOrder(OrderCreateRequest req) {
    Pharmacy pharmacy = pharmacyRepository.findById(req.getPharmacyId())
        .orElseThrow(() -> new RuntimeException("약국 정보를 찾을 수 없습니다."));

    if (req.getItems() == null || req.getItems().isEmpty()) {
      throw new RuntimeException("발주 요청 품목이 없습니다.");
    }

    BigDecimal totalPrice = BigDecimal.ZERO;
    List<OrderItem> orderItems = new ArrayList<>();

    for (OrderCreateRequest.Item reqItem : req.getItems()) {
      Product product = productRepository.findById(reqItem.getProductId())
          .orElseThrow(() -> new RuntimeException("제품 정보를 찾을 수 없습니다."));

      int quantity = reqItem.getQuantity();

      BigDecimal unitPrice = product.getUnitPrice();
      BigDecimal subtotalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
      totalPrice = totalPrice.add(subtotalPrice);

      OrderItem orderItem = OrderItem.builder()
          .orders(null) // 나중에 세팅
          .product(product)
          .quantity(quantity)
          .unitPrice(unitPrice)
          .subtotalPrice(subtotalPrice)
          .build();
      orderItems.add(orderItem);

      inventoryTxService.createInventoryTx(
          product.getProductId(), InventoryTxType.ORDER, reqItem.getQuantity()
      );
    }

    BigDecimal balance = pharmacy.getBalance();
    BigDecimal limit = new BigDecimal("10000000");
    BigDecimal next = balance.add(totalPrice);
    if (next.compareTo(limit) > 0) {
      throw new RuntimeException("외상 한도를 초과합니다.");
    }

    balanceTxService.createBalanceTx(
        pharmacy.getPharmacyId(), BalanceTxType.ORDER, totalPrice
    );

    Orders orders = Orders.builder()
        .pharmacy(pharmacy)
        .status(OrderStatus.REQUESTED)
        .totalPrice(totalPrice)
        .build();
    orderRepository.save(orders);

    for (OrderItem orderItem : orderItems) {
      orderItem.setOrders(orders);
    }
    orderItemRepository.saveAll(orderItems);

    return new OrderCreateResponse(orders.getOrderId());
  }

  /**
   * 본사에서 발주 요청 목록을 조회합니다. 기간이나 상태를 지정하지 않으면 모든 발주 요청을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<OrderListResponse> getOrders(
      OrderStatus status, Region region, LocalDateTime start, LocalDateTime end,
      int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size);
    return orderRepository.findByStatusAndRegionAndCreatedAtBetween(
            status, region, start, end, pageable)
        .map(orders -> OrderListResponse.builder()
            .orderId(orders.getOrderId())
            .pharmacyId(orders.getPharmacy().getPharmacyId())
            .pharmacyName(orders.getPharmacy().getPharmacyName())
            .status(orders.getStatus())
            .summary(makeSummary(orders))
            .totalPrice(orders.getTotalPrice())
            .createdAt(orders.getCreatedAt())
            .build());
  }

  /**
   * 가맹점에서 발주 요청 목록을 조회합니다. 상태를 지정하지 않으면 해당 가맹점의 모든 발주 요청을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<OrderListResponse> getOrdersByPharmacy(
      Long pharmacyId, OrderStatus status, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size);
    return orderRepository.findByPharmacyIdAndStatus(pharmacyId, status, pageable)
        .map(orders -> OrderListResponse.builder()
            .orderId(orders.getOrderId())
            .pharmacyId(pharmacyId)
            .pharmacyName(orders.getPharmacy().getPharmacyName())
            .status(orders.getStatus())
            .summary(makeSummary(orders))
            .totalPrice(orders.getTotalPrice())
            .createdAt(orders.getCreatedAt())
            .build());
  }

  /**
   * 발주 요청 상세를 조회합니다.
   */
  @Transactional(readOnly = true)
  public OrderDetailResponse getOrderById(Long orderId) {
    Orders orders = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("발주 요청 정보를 찾을 수 없습니다."));

    List<OrderItem> items = orderItemRepository.findByOrders(orders);
    List<OrderDetailResponse.Item> itemsList = items.stream()
        .map(item -> OrderDetailResponse.Item.builder()
            .productId(item.getProduct().getProductId())
            .productName(item.getProduct().getProductName())
            .mainCategory(item.getProduct().getMainCategory())
            .subCategory(item.getProduct().getSubCategory())
            .manufacturer(item.getProduct().getManufacturer())
            .productImgUrl(item.getProduct().getProductImgUrl())
            .quantity(item.getQuantity())
            .unit(item.getProduct().getUnit())
            .unitPrice(item.getUnitPrice())
            .subtotalPrice(item.getSubtotalPrice())
            .build()
        ).toList();

    return OrderDetailResponse.builder()
        .orderId(orders.getOrderId())
        .pharmacyId(orders.getPharmacy().getPharmacyId())
        .pharmacyName(orders.getPharmacy().getPharmacyName())
        .status(orders.getStatus())
        .summary(makeSummary(items))
        .totalPrice(orders.getTotalPrice())
        .createdAt(orders.getCreatedAt())
        .updatedAt(orders.getUpdatedAt())
        .items(itemsList)
        .build();
  }

  private String makeSummary(Orders orders) {
    List<OrderItem> items = orderItemRepository.findByOrders(orders);
    String firstProductName = items.get(0).getProduct().getProductName();
    int count = items.size();
    return (count > 1) ? firstProductName + " 외 " + (count - 1) + "개" : firstProductName;
  }

  private String makeSummary(List<OrderItem> items) {
    String firstProductName = items.get(0).getProduct().getProductName();
    int count = items.size();
    return (count > 1) ? firstProductName + " 외 " + (count - 1) + "개" : firstProductName;
  }

  /**
   * 발주 요청의 상태를 업데이트합니다. 업데이트 상태가 CANCELED 경우, 유저의 미정산 잔액을 감소시키고 제품의 재고를 복구합니다.
   */
  @Transactional
  public void updateOrderStatus(Long orderId, OrderUpdateRequest req) {
    Orders orders = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("발주 요청 정보를 찾을 수 없습니다."));

    if (orders.getStatus() == OrderStatus.CANCELED) {
      throw new RuntimeException("이미 취소된 발주 요청입니다.");
    } else if (orders.getStatus() == OrderStatus.COMPLETED) {
      throw new RuntimeException("이미 완료된 발주 요청입니다.");
    }

    if (req.getStatus() == OrderStatus.CANCELED) {
      balanceTxService.createBalanceTx(
          orders.getPharmacy().getPharmacyId(), BalanceTxType.ORDER_CANCEL, orders.getTotalPrice()
      );

      List<OrderItem> items = orderItemRepository.findByOrders(orders);
      for (OrderItem oi : items) {
        inventoryTxService.createInventoryTx(
            oi.getProduct().getProductId(), InventoryTxType.ORDER_CANCEL, oi.getQuantity()
        );
      }
    }

    orders.setStatus(req.getStatus());
    orderRepository.save(orders);
  }

  /**
   * 발주 요청을 삭제합니다.
   */
  @Transactional
  public void deleteOrder(Long orderId) {
    Orders orders = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("발주 요청 정보를 찾을 수 없습니다."));

    orderItemRepository.deleteAllByOrders(orders);
    orderRepository.delete(orders);
  }
}
