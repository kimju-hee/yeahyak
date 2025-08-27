package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.ForecastProduct;
import com.yeahyak.backend.service.ForecastService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 발주 예측 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
public class ForecastController {

  private final ForecastService forecastService;

  @PostMapping(path = "/order", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<List<ForecastProduct>>> forecastOrder(
      @RequestParam("file") MultipartFile file
  ) {
    List<ForecastProduct> result = forecastService.forecastOrder(file);
    return ResponseEntity.ok(ApiResponse.ok(result)); // 200 OK
  }
}
