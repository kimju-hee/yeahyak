package com.yeahyak.backend.controller;

import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.CreditStatus;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
    public ResponseEntity<?> pending() {
        return ResponseEntity.ok(Map.of("success", true, "data", creditService.getPendingCredits()));
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<?> approve(@PathVariable Long userId, @RequestParam(required = false) String note) {
        var data = creditService.approveSettlement(userId, note);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}

