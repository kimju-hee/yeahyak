package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.PharmacyRequestDetailResponse;
import com.yeahyak.backend.dto.PharmacyRequestListResponse;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.PharmacyRequest;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.PharmacyRequestStatus;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.PharmacyRequestRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PharmacyRequestService {

  private final PharmacyRequestRepository pharmacyRequestRepository;
  private final PharmacyRepository pharmacyRepository;

  @Transactional(readOnly = true)
  public Page<PharmacyRequestListResponse> getPharmacyRequests(
      PharmacyRequestStatus status, Region region, String keyword, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size);
    Page<PharmacyRequest> pharmacyRequests =
        pharmacyRequestRepository.findByStatusAndRegionAndPharmacyName(
            status, region, keyword, pageable
        );

    return pharmacyRequests.map(pharmacyRequest -> PharmacyRequestListResponse.builder()
        .pharmacyRequestId(pharmacyRequest.getPharmacyRequestId())
        .userId(pharmacyRequest.getUser().getUserId())
        .email(pharmacyRequest.getUser().getEmail())
        .pharmacyName(pharmacyRequest.getPharmacyName())
        .bizRegNo(pharmacyRequest.getBizRegNo())
        .region(pharmacyRequest.getRegion())
        .contact(pharmacyRequest.getContact())
        .status(pharmacyRequest.getStatus())
        .createdAt(pharmacyRequest.getCreatedAt())
        .build());
  }

  @Transactional(readOnly = true)
  public PharmacyRequestDetailResponse getPharmacyRequestById(Long pharmacyRequestId) {
    PharmacyRequest pharmacyRequest = pharmacyRequestRepository.findById(pharmacyRequestId)
        .orElseThrow(() -> new RuntimeException("약국 등록 요청을 찾을 수 없습니다."));
    return PharmacyRequestDetailResponse.builder()
        .pharmacyRequestId(pharmacyRequest.getPharmacyRequestId())
        .userId(pharmacyRequest.getUser().getUserId())
        .email(pharmacyRequest.getUser().getEmail())
        .pharmacyName(pharmacyRequest.getPharmacyName())
        .bizRegNo(pharmacyRequest.getBizRegNo())
        .representativeName(pharmacyRequest.getRepresentativeName())
        .postcode(pharmacyRequest.getPostcode())
        .address(pharmacyRequest.getAddress())
        .detailAddress(pharmacyRequest.getDetailAddress())
        .region(pharmacyRequest.getRegion())
        .contact(pharmacyRequest.getContact())
        .status(pharmacyRequest.getStatus())
        .createdAt(pharmacyRequest.getCreatedAt())
        .updatedAt(pharmacyRequest.getUpdatedAt())
        .build();
  }

  @Transactional
  public void approvePharmacyRequest(Long pharmacyRequestId) {
    PharmacyRequest pharmacyRequest = pharmacyRequestRepository.findById(pharmacyRequestId)
        .orElseThrow(() -> new RuntimeException("약국 등록 요청을 찾을 수 없습니다."));

    if (pharmacyRequest.getStatus() != PharmacyRequestStatus.PENDING) {
      throw new RuntimeException("이미 처리된 약국 등록 요청입니다.");
    }
    if (pharmacyRepository.existsByBizRegNo(pharmacyRequest.getBizRegNo())) {
      throw new RuntimeException("이미 등록된 사업자등록번호입니다.");
    }
    User user = pharmacyRequest.getUser();

    Pharmacy pharmacy = Pharmacy.builder()
        .user(user)
        .pharmacyName(pharmacyRequest.getPharmacyName())
        .bizRegNo(pharmacyRequest.getBizRegNo())
        .representativeName(pharmacyRequest.getRepresentativeName())
        .postcode(pharmacyRequest.getPostcode())
        .address(pharmacyRequest.getAddress())
        .detailAddress(pharmacyRequest.getDetailAddress())
        .region(pharmacyRequest.getRegion())
        .contact(pharmacyRequest.getContact())
        .balance(BigDecimal.ZERO)
        .build();
    pharmacyRepository.save(pharmacy);

    pharmacyRequest.setStatus(PharmacyRequestStatus.APPROVED);
    pharmacyRequestRepository.save(pharmacyRequest);
  }

  @Transactional
  public void rejectPharmacyRequest(Long pharmacyRequestId) {
    PharmacyRequest pharmacyRequest = pharmacyRequestRepository.findById(pharmacyRequestId)
        .orElseThrow(() -> new RuntimeException("약국 등록 요청 정보를 찾을 수 없습니다."));

    if (pharmacyRequest.getStatus() != PharmacyRequestStatus.PENDING) {
      throw new RuntimeException("이미 처리된 약국 등록 요청입니다.");
    }

    pharmacyRequest.setStatus(PharmacyRequestStatus.REJECTED);
    pharmacyRequestRepository.save(pharmacyRequest);
  }
}
