package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ReturnRequestDto;
import com.yeahyak.backend.dto.ReturnResponseDto;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import com.yeahyak.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/branch/returns")
public class ReturnController {

    private final ReturnService returnService;

    @GetMapping
    public ResponseEntity<?> getReturnsByPharmacy(
            @RequestParam Long pharmacyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(returnService.getReturnsByPharmacy(pharmacyId, page, size, status));
    }

    @GetMapping("/{returnId}")
    public ResponseEntity<?> getReturnDetail(@PathVariable Long returnId) {
        ReturnResponseDto response = returnService.getReturnDetail(returnId);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }


    @PostMapping
    public ResponseEntity<?> requestReturn(@RequestBody ReturnRequestDto dto) {
        ReturnResponseDto response = returnService.createReturnRequest(dto);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    @PostMapping("/approve/{returnId}")
    public ResponseEntity<?> approve(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.APPROVED);
        return ResponseEntity.ok("승인 처리 완료");
    }

    @PostMapping("/reject/{returnId}")
    public ResponseEntity<?> reject(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.REJECTED);
        return ResponseEntity.ok("반품 거절 처리 완료");
    }

    @PostMapping("/process/{returnId}")
    public ResponseEntity<?> process(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.PROCESSING);
        return ResponseEntity.ok("반품 처리 중으로 변경");
    }

    @PostMapping("/complete/{returnId}")
    public ResponseEntity<?> complete(@PathVariable Long returnId) {
        returnService.updateStatus(returnId, ReturnStatus.COMPLETED);
        return ResponseEntity.ok("반품 완료 처리 완료");
    }
}
