package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.PointRequestDto;
import com.yeahyak.backend.service.PointService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/points")
public class PointController {

    private final PointService pointService;

    @PostMapping("/request")
    public ResponseEntity<String> requestPoint(@RequestBody PointRequestDto dto) {
        pointService.requestPointCharge(dto);
        return ResponseEntity.ok("요청 완료");
    }

    @PostMapping("/approve/{pointId}")
    public ResponseEntity<String> approvePoint(@PathVariable Long pointId) {
        pointService.approvePointCharge(pointId);
        return ResponseEntity.ok("승인 완료");
    }

    @PostMapping("/reject/{pointId}")
    public ResponseEntity<String> rejectPoint(@PathVariable Long pointId) {
        pointService.rejectPointCharge(pointId);
        return ResponseEntity.ok("거절 완료");
    }
}
