package com.yeahyak.backend.controller;


import com.yeahyak.backend.dto.ForecastProductDto;
import com.yeahyak.backend.dto.JinhoResponse;
import com.yeahyak.backend.service.ForecastRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/forecast")
public class ForecastController {


    private final ForecastRequestService forecastRequestService;


    @PostMapping("/order")
    public ResponseEntity<JinhoResponse<ForecastProductDto>> forecastOrder(@RequestParam("file") MultipartFile file) {
        List<ForecastProductDto> result = forecastRequestService.predictOrder(file);
        return ResponseEntity.ok(
                new JinhoResponse<>(true, result, 1, result.size(), 0)
        );
    }
}