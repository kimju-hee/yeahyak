package com.yeahyak.backend.controller;

import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.enums.Status;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.UserRole;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/pharmacies")
public class PharmacyAdminController {

    private final PharmacyRepository pharmacyRepository;
    private final UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<Pharmacy>> getPendingPharmacies() {
        List<Pharmacy> pending = pharmacyRepository.findByStatus(Status.PENDING);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<String> approvePharmacy(@PathVariable Long id) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다"));

        pharmacy.setStatus(Status.ACTIVE);
        pharmacyRepository.save(pharmacy);

        User user = pharmacy.getUser();
        user.setUserRole(UserRole.PHARMACIST);
        userRepository.save(user);

        return ResponseEntity.ok("약국이 승인되었고, 권한이 부여되었습니다.");
    }


    @PostMapping("/{id}/reject")
    public ResponseEntity<String> rejectPharmacy(@PathVariable Long id) {
        Pharmacy pharmacy= pharmacyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다."));
        pharmacy.setStatus(Status.REJECTED);
        pharmacyRepository.save(pharmacy);
        return ResponseEntity.ok("약국이 거절되었습니다.");
    }
}
