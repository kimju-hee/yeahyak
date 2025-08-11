package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.OrderRequest;
import com.yeahyak.backend.dto.OrderResponse;
import com.yeahyak.backend.entity.enums.OrderStatus;
import com.yeahyak.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderRequest orderRequest) {
        OrderResponse response = orderService.createOrder(orderRequest);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String pharmacyName
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size, status, pharmacyName));
    }

    @GetMapping("/branch/orders")
    public ResponseEntity<?> getBranchOrders(
            @RequestParam Long pharmacyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.getOrdersByPharmacy(pharmacyId, page, size, status));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orderService.getOrderDetail(orderId)
        ));
    }

    @PostMapping("/{orderId}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable Long orderId) {
        orderService.approveOrder(orderId);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PostMapping("/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long orderId) {
        orderService.rejectOrder(orderId);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PatchMapping("/{orderId}")
    public ResponseEntity<?> patchOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

}
