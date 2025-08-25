package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ReturnCreateRequest;
import com.yeahyak.backend.dto.ReturnCreateResponse;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import com.yeahyak.backend.service.ReturnService;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/returns")
public class ReturnController {

  private final ReturnService returnService;

  /**
   * 반품 요청을 생성합니다.
   */
  @PostMapping
  public ResponseEntity<?> createReturn(
      @RequestBody ReturnCreateRequest returnRequest
  ) {
    ReturnCreateResponse response = returnService.createReturnRequest(returnRequest);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", response
    ));
  }

  /**
   * 본사에서 반품 요청 목록을 조회합니다.
   */
  @GetMapping
  public ResponseEntity<?> getReturns(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
      @RequestParam(required = false) ReturnStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    return ResponseEntity.ok(
        returnService.getReturns(startDateTime, endDateTime, status, page, size));
  }

  /**
   * 가맹점에서 반품 요청 목록을 조회합니다.
   */
  @GetMapping("/{pharmacyId}")
  public ResponseEntity<?> getReturnsByPharmacy(
      @PathVariable Long pharmacyId,
      @RequestParam(required = false) ReturnStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    return ResponseEntity.ok(
        returnService.getReturnsByPharmacy(pharmacyId, status, page, size));
  }

  /**
   * 반품 요청 상세을 조회합니다.
   */
  @GetMapping("/{returnId}")
  public ResponseEntity<?> getReturnDetail(
      @PathVariable Long returnId
  ) {
    ReturnCreateResponse response = returnService.getReturnDetail(returnId);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", response));
  }

  /**
   * 반품 요청의 상태를 업데이트합니다.
   */
  @PatchMapping("/{returnId}")
  public ResponseEntity<?> updateReturnStatus(
      @PathVariable Long returnId,
      @RequestBody Map<String, String> request
  ) {
    String status = request.get("pharmacyRequestStatus");
    returnService.updateReturnStatus(returnId, status);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", ""
    ));
  }

  /**
   * 반품 요청을 삭제합니다.
   */
  @DeleteMapping("/{returnId}")
  public ResponseEntity<?> deleteReturn(
      @PathVariable Long returnId
  ) {
    returnService.deleteReturn(returnId);
    return ResponseEntity.ok(Map.of(
        "success", true,
        "data", ""
    ));
  }
}
