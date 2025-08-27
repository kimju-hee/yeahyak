package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.PharmacyApprovalResponse;
import com.yeahyak.backend.dto.PharmacyDto;
import com.yeahyak.backend.dto.PharmacyRequestDto;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.PharmacyRegistrationRequest;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.Status;
import com.yeahyak.backend.entity.enums.UserRole;
import com.yeahyak.backend.repository.PharmacyRegistrationRequestRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/pharmacies")
public class PharmacyAdminController {

    private final PharmacyRepository pharmacyRepository;
    private final PharmacyRegistrationRequestRepository registrationRequestRepository;
    private final AuthService authService;

    @GetMapping("/requests")
    public ResponseEntity<?> getBranchPharmacyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());
        Page<PharmacyApprovalResponse> result = authService.getBranchRequests(pageable);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result.getContent(),
                "totalPages", result.getTotalPages(),
                "totalElements", result.getTotalElements(),
                "currentPage", result.getNumber()
        ));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Pharmacy>> getPendingPharmacies() {
        List<Pharmacy> pending = pharmacyRepository.findByStatus(Status.PENDING);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approvePharmacy(@PathVariable Long id) {
        authService.approvePharmacy(id);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectPharmacy(@PathVariable Long id) {
        authService.rejectPharmacy(id);
        return ResponseEntity.ok(Map.of("success", true, "data", ""));
    }

}
