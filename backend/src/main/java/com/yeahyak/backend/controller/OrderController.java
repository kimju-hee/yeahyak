package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.OrderCreateRequest;
import com.yeahyak.backend.dto.OrderCreateResponse;
import com.yeahyak.backend.entity.enums.OrderStatus;
import com.yeahyak.backend.service.OrderService;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orderService;

  /**
   * 발주 요청을 생성합니다.
   */
  @PostMapping
  public ResponseEntity<?> createOrder(
      @RequestBody OrderCreateRequest orderRequest
  ) {
    OrderCreateResponse response = orderService.createOrder(orderRequest);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", response
    ));
  }

  /**
   * 본사에서 발주 요청 목록을 조회합니다.
   */
  @GetMapping
  public ResponseEntity<?> getOrders(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
      @RequestParam(required = false) OrderStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    return ResponseEntity.ok(
        orderService.getOrders(startDateTime, endDateTime, status, page, size));
  }

  /**
   * 가맹점에서 발주 요청 목록을 조회합니다.
   */
  @GetMapping("/{pharmacyId}")
  public ResponseEntity<?> getOrders(
      @PathVariable Long pharmacyId,
      @RequestParam(required = false) OrderStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    return ResponseEntity.ok(
        orderService.getOrdersByPharmacy(pharmacyId, status, page, size));
  }

  /**
   * 발주 요청 상세를 조회합니다.
   */
  @GetMapping("/{orderId}")
  public ResponseEntity<?> getOrderDetail(
      @PathVariable Long orderId
  ) {
    OrderCreateResponse response = orderService.getOrderDetail(orderId);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", response
    ));
  }

  /**
   * 발주 요청의 상태를 업데이트합니다.
   */
  @PatchMapping("/{orderId}")
  public ResponseEntity<?> process(
      @PathVariable Long orderId,
      @RequestBody Map<String, String> request
  ) {
    String status = request.get("pharmacyRequestStatus");
    orderService.updateOrderStatus(orderId, status);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", ""
    ));
  }

  /**
   * 발주 요청을 삭제합니다.
   */
  @DeleteMapping("/{orderId}")
  public ResponseEntity<?> deleteReturn(
      @PathVariable Long orderId
  ) {
    orderService.deleteOrder(orderId);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", ""
    ));
  }
}
