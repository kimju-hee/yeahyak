package com.yeahyak.backend.controller;


import com.yeahyak.backend.deprecated.JinhoResponse;
import com.yeahyak.backend.dto.todo.ForecastProductDto;
import com.yeahyak.backend.service.ForecastRequestService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/forecast")
public class ForecastController {


  private final ForecastRequestService forecastRequestService;


  @PostMapping("/order")
  public ResponseEntity<JinhoResponse<ForecastProductDto>> forecastOrder(
      @RequestParam("file") MultipartFile file) {
    List<ForecastProductDto> result = forecastRequestService.predictOrder(file);
    return ResponseEntity.ok(
        new JinhoResponse<>(true, result, 1, result.size(), 0)
    );
  }
}