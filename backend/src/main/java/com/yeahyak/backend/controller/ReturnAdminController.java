package com.yeahyak.backend.controller;

import com.yeahyak.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/returns")
public class ReturnAdminController {

    private final ReturnService returnService;

    @PostMapping("/{returnId}/approve")
    public ResponseEntity<?> approve(@PathVariable Long returnId) {
        returnService.approve(returnId);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PostMapping("/{returnId}/reject")
    public ResponseEntity<?> reject(@PathVariable Long returnId) {
        returnService.reject(returnId);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }
}