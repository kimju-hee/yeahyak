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
    private final UserRepository userRepository;
    private final PharmacyRegistrationRequestRepository registrationRequestRepository;

    @GetMapping("/requests")
    public ResponseEntity<?> getPharmacyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());
        Page<PharmacyRegistrationRequest> requests = registrationRequestRepository.findByStatus(Status.PENDING, pageable);

        List<PharmacyApprovalResponse> result = requests.stream().map(req -> {
            Pharmacy pharmacy = req.getPharmacy();
            return new PharmacyApprovalResponse(
                    new PharmacyRequestDto(
                            req.getRegRequestId(),
                            pharmacy.getPharmacyId(),
                            req.getRequestedAt(),
                            req.getStatus(),
                            req.getReviewedAt()
                    ),
                    new PharmacyDto(
                            pharmacy.getPharmacyId(),
                            pharmacy.getUser().getUserId(),
                            pharmacy.getPharmacyName(),
                            pharmacy.getBizRegNo(),
                            pharmacy.getRepresentativeName(),
                            pharmacy.getPostcode(),
                            pharmacy.getAddress(),
                            pharmacy.getDetailAddress(),
                            pharmacy.getPhoneNumber(),
                            pharmacy.getStatus()
                    )
            );
        }).toList();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result,
                "totalPages", requests.getTotalPages(),
                "totalElements", requests.getTotalElements(),
                "currentPage", requests.getNumber()
        ));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Pharmacy>> getPendingPharmacies() {
        List<Pharmacy> pending = pharmacyRepository.findByStatus(Status.PENDING);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approvePharmacy(@PathVariable Long id) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다"));

        pharmacy.setStatus(Status.ACTIVE);
        pharmacyRepository.save(pharmacy);

        User user = pharmacy.getUser();
        user.setUserRole(UserRole.PHARMACIST);
        userRepository.save(user);

        PharmacyRegistrationRequest request = registrationRequestRepository.findByPharmacy(pharmacy)
                .orElseThrow(() -> new IllegalArgumentException("등록 요청이 존재하지 않습니다."));
        request.setStatus(Status.ACTIVE);
        request.setReviewedAt(LocalDateTime.now());
        registrationRequestRepository.save(request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", ""
        ));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectPharmacy(@PathVariable Long id) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다."));

        pharmacy.setStatus(Status.REJECTED);
        pharmacyRepository.save(pharmacy);

        PharmacyRegistrationRequest request = registrationRequestRepository.findByPharmacy(pharmacy)
                .orElseThrow(() -> new IllegalArgumentException("등록 요청이 존재하지 않습니다."));
        request.setStatus(Status.REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        registrationRequestRepository.save(request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", ""
        ));
    }
}
