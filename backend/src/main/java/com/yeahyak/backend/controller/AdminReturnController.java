package com.yeahyak.backend.controller;

import com.yeahyak.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/returns")
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

}