package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.PharmacyRequestDetailResponse;
import com.yeahyak.backend.dto.PharmacyRequestListResponse;
import com.yeahyak.backend.entity.enums.PharmacyRequestStatus;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.service.PharmacyRequestService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 약국 등록 요청 관련 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/pharmacy-requests")
@RequiredArgsConstructor
public class PharmacyRequestController {

  private final PharmacyRequestService pharmacyRequestService;

  /**
   * 약국 등록 요청 목록을 조회합니다. (상태/지역/키워드 + 페이지네이션)
   */
  @GetMapping
  public ResponseEntity<ApiResponse<List<PharmacyRequestListResponse>>> getPharmacyRequests(
      @RequestParam(required = false) PharmacyRequestStatus status,
      @RequestParam(required = false) Region region,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<PharmacyRequestListResponse> result = pharmacyRequestService.getPharmacyRequests(
        status, region, keyword, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * 약국 등록 요청 상세를 조회합니다.
   */
  @GetMapping("/{pharmacyRequestId}")
  public ResponseEntity<ApiResponse<PharmacyRequestDetailResponse>> getPharmacyRequestById(
      @PathVariable Long pharmacyRequestId
  ) {
    PharmacyRequestDetailResponse detail = pharmacyRequestService.getPharmacyRequestById(
        pharmacyRequestId);
    return ResponseEntity.ok(ApiResponse.ok(detail)); // 200 OK
  }

  /**
   * 약국 등록 요청을 승인합니다.
   */
  @PostMapping("/{pharmacyRequestId}/approve")
  public ResponseEntity<Void> approvePharmacyRequest(
      @PathVariable Long pharmacyRequestId
  ) {
    pharmacyRequestService.approvePharmacyRequest(pharmacyRequestId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 약국 등록 요청을 거절합니다.
   */
  @PostMapping("/{pharmacyRequestId}/reject")
  public ResponseEntity<Void> rejectPharmacyRequest(
      @PathVariable Long pharmacyRequestId
  ) {
    pharmacyRequestService.rejectPharmacyRequest(pharmacyRequestId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }
}
