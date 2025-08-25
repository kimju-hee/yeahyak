package com.yeahyak.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.CreditStatus;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.service.CreditService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/credit")
public class CreditAdminController {

    private final UserRepository userRepository;
    private final CreditService creditService;

    @PostMapping("/settlement/{userId}")
    public ResponseEntity<?> settle(@PathVariable Long userId, @RequestParam(required = false) String note) {
        User u = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        int before = u.getPoint();
        int settled = Math.abs(before);
        if (before != 0) {
            u.setPoint(0);
            u.setCreditStatus(CreditStatus.FULL);
            userRepository.save(u);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("userId", userId, "settledAmount", settled)));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> pending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var pendingPage = creditService.getPendingCredits(page, size);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "data", pendingPage.getContent(),
                        "page", pendingPage.getNumber(),
                        "size", pendingPage.getSize(),
                        "totalElements", pendingPage.getTotalElements(),
                        "totalPages", pendingPage.getTotalPages(),
                        "last", pendingPage.isLast()
                )
        );
    }



    @PostMapping("/approve/{userId}")
    public ResponseEntity<?> approve(@PathVariable Long userId, @RequestParam(required = false) String note) {
        var data = creditService.approveSettlement(userId, note);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}