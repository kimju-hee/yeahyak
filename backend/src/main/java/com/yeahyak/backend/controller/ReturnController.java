package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ReturnRequestDto;
import com.yeahyak.backend.entity.ReturnStatus;
import com.yeahyak.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/returns")
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping
    public ResponseEntity<?> requestReturn(@RequestBody ReturnRequestDto dto) {
        returnService.createReturnRequest(dto);
        return ResponseEntity.ok("반품 요청이 접수되었습니다.");
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
