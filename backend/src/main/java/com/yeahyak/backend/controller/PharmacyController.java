package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.BalanceTxListResponse;
import com.yeahyak.backend.dto.PharmacyListResponse;
import com.yeahyak.backend.dto.SettlementRequest;
import com.yeahyak.backend.dto.SettlementResponse;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.service.BalanceTxService;
import com.yeahyak.backend.service.PharmacyService;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
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
 * 약국 관련 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor
@Validated
public class PharmacyController {

  private final PharmacyService pharmacyService;
  private final BalanceTxService balanceTxService;

  /**
   * 약국 목록을 조회합니다. (미정산여부/지역/키워드 + 페이지네이션)
   */
  @GetMapping
  public ResponseEntity<ApiResponse<List<PharmacyListResponse>>> getPharmacies(
      @RequestParam(required = false) Boolean unsettled,
      @RequestParam(required = false) Region region,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<PharmacyListResponse> result = pharmacyService.getPharmacies(
        unsettled, region, keyword, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * 특정 약국의 거래 내역을 조회합니다. (거래유형/기간 + 페이지네이션)
   */
  @GetMapping("/{pharmacyId}/balance-txs")
  public ResponseEntity<ApiResponse<List<BalanceTxListResponse>>> getBalanceTxsByPharmacy(
      @PathVariable Long pharmacyId,
      @RequestParam(required = false) BalanceTxType type,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<BalanceTxListResponse> result = balanceTxService.getBalanceTxs(
        pharmacyId, type, start, end, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * 특정 약국의 정산을 생성합니다.
   */
  @PostMapping("/{pharmacyId}/settlement")
  public ResponseEntity<ApiResponse<SettlementResponse>> createSettlement(
      @PathVariable Long pharmacyId
  ) {
    SettlementResponse res = balanceTxService.settlement(new SettlementRequest(pharmacyId));
    URI location = URI.create("/api/pharmacies/" + pharmacyId + "/balance-txs");
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }
}
