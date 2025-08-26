package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.OrderCreateRequest;
import com.yeahyak.backend.dto.OrderCreateResponse;
import com.yeahyak.backend.dto.OrderDetailResponse;
import com.yeahyak.backend.dto.OrderListResponse;
import com.yeahyak.backend.dto.OrderUpdateRequest;
import com.yeahyak.backend.entity.enums.OrderStatus;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.service.OrderService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 발주 관련 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping(value = "/api/orders", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
public class OrderController {

  private final OrderService orderService;

  /**
   * (가맹점) 발주를 생성합니다.
   */
  @PreAuthorize("hasRole('PHARMACY')")
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<ApiResponse<OrderCreateResponse>> createOrder(
      @RequestBody @Valid OrderCreateRequest request
  ) {
    OrderCreateResponse res = orderService.createOrder(request);
    URI location = URI.create("/api/orders/" + res.getOrderId());
    return ResponseEntity
        .created(location)
        .body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * (본사) 발주 목록을 조회합니다. (상태/지역/기간 + 페이지네이션)
   */
  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/hq")
  public ResponseEntity<ApiResponse<List<OrderListResponse>>> getOrdersForHq(
      @RequestParam(required = false) OrderStatus status,
      @RequestParam(required = false) Region region,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<OrderListResponse> result = orderService.getOrders(status, region, start, end, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * (가맹점) 발주 목록을 조회합니다. (상태 + 페이지네이션)
   */
  @PreAuthorize("hasRole('PHARMACY')")
  @GetMapping("/branch}")
  public ResponseEntity<ApiResponse<List<OrderListResponse>>> getOrdersForBranch(
      @RequestParam Long pharmacyId,
      @RequestParam(required = false) OrderStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<OrderListResponse> result = orderService.getOrdersByPharmacy(
        pharmacyId, status, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * (본사, 가맹점) 발주 상세를 조회합니다.
   */
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{orderId}")
  public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(
      @PathVariable Long orderId
  ) {
    OrderDetailResponse detail = orderService.getOrderById(orderId);
    return ResponseEntity.ok(ApiResponse.ok(detail)); // 200 OK
  }

  /**
   * (본사) 발주 상태를 변경합니다.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping(value = "/{orderId}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Void> updateOrderStatus(
      @PathVariable Long orderId,
      @RequestBody @Valid OrderUpdateRequest request
  ) {
    orderService.updateOrderStatus(orderId, request);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 발주를 삭제합니다.
   */
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{orderId}")
  public ResponseEntity<Void> deleteOrder(
      @PathVariable Long orderId
  ) {
    orderService.deleteOrder(orderId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }
}
