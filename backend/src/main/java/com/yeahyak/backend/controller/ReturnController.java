package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ReturnCreateRequest;
import com.yeahyak.backend.dto.ReturnCreateResponse;
import com.yeahyak.backend.dto.ReturnDetailResponse;
import com.yeahyak.backend.dto.ReturnListResponse;
import com.yeahyak.backend.dto.ReturnUpdateRequest;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import com.yeahyak.backend.service.ReturnService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 반품 관련 API 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnController {

  private final ReturnService returnService;

  /**
   * (가맹점) 반품을 생성합니다.
   */
  @PostMapping
  public ResponseEntity<ApiResponse<ReturnCreateResponse>> createReturn(
      @RequestBody @Valid ReturnCreateRequest request
  ) {
    ReturnCreateResponse res = returnService.createReturn(request);
    URI location = URI.create("/api/returns/" + res.getReturnId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * (본사) 반품 목록을 조회합니다.
   */
  @GetMapping("/hq")
  public ResponseEntity<ApiResponse<List<ReturnListResponse>>> getReturnsForHq(
      @RequestParam(required = false) ReturnStatus status,
      @RequestParam(required = false) Region region,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<ReturnListResponse> result = returnService.getReturns(status, region, start, end, page,
        size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * (가맹점) 반품 목록을 조회합니다.
   */
  @GetMapping("/branch")
  public ResponseEntity<ApiResponse<List<ReturnListResponse>>> getReturnsForBranch(
      @RequestParam Long pharmacyId,
      @RequestParam(required = false) ReturnStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Page<ReturnListResponse> result = returnService.getReturnsByPharmacy(
        pharmacyId, status, page, size);
    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * (본사, 가맹점) 반품 상세를 조회합니다.
   */
  @GetMapping("/{returnId}")
  public ResponseEntity<ApiResponse<ReturnDetailResponse>> getReturnDetail(
      @PathVariable Long returnId
  ) {
    ReturnDetailResponse detail = returnService.getReturnById(returnId);
    return ResponseEntity.ok(ApiResponse.ok(detail)); // 200 OK
  }

  /**
   * (본사) 반품 상태를 변경합니다.
   */
  @PatchMapping("/{returnId}/update")
  public ResponseEntity<Void> updateReturnStatus(
      @PathVariable Long returnId,
      @RequestBody @Valid ReturnUpdateRequest request
  ) {
    returnService.updateReturnStatus(returnId, request);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 반품을 삭제합니다.
   */
  @DeleteMapping("/{returnId}")
  public ResponseEntity<Void> deleteReturn(
      @PathVariable Long returnId
  ) {
    returnService.deleteReturn(returnId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }
}
