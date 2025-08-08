package com.yeahyak.backend.controller;

import com.yeahyak.backend.entity.enums.ReturnStatus;
import com.yeahyak.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/returns")
public class AdminReturnController {

    private final ReturnService returnService;

    @GetMapping
    public ResponseEntity<?> getAllReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String pharmacyName
    ) {
        return ResponseEntity.ok(returnService.getAllReturns(page, size, status, pharmacyName));
    }

    @GetMapping("/{returnId}")
    public ResponseEntity<?> getReturnDetail(@PathVariable Long returnId) {
        return ResponseEntity.ok(
                returnService.getReturnDetail(returnId)
        );
    }

    @PatchMapping("/{returnId}/approve")
    public ResponseEntity<?> approve(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.APPROVED);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PatchMapping("/{returnId}/reject")
    public ResponseEntity<?> reject(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.REJECTED);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PatchMapping("/{returnId}/process")
    public ResponseEntity<?> process(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.PROCESSING);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PatchMapping("/{returnId}/complete")
    public ResponseEntity<?> complete(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.COMPLETED);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PatchMapping("/{returnId}")
    public ResponseEntity<?> updateReturnStatus(
            @PathVariable Long returnId,
            @RequestBody Map<String, String> request
    ) {
        String statusStr = request.get("status");
        ReturnStatus status = ReturnStatus.valueOf(statusStr.toUpperCase());
        returnService.updateStatus(returnId, status);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @DeleteMapping("/{returnId}")
    public ResponseEntity<?> deleteReturn(@PathVariable Long returnId) {
        returnService.deleteReturn(returnId);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }
}