package com.yeahyak.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yeahyak.backend.dto.ForecastProduct;
import com.yeahyak.backend.dto.ForecastRawResult;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.exception.FlaskPredictException;
import com.yeahyak.backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForecastService {

  private final ProductRepository productRepo;
  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  @Value("${ai.service.url}/forecast/order")
  private String aiForecastUrl;

  public List<ForecastProduct> forecastOrder(MultipartFile file) {
    try {
      HttpHeaders partHeaders = new HttpHeaders();
      partHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);

      ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
        @Override
        public String getFilename() {
          return file.getOriginalFilename();
        }
      };

      MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
      body.add("file", new HttpEntity<>(resource, partHeaders));

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.MULTIPART_FORM_DATA);

      HttpEntity<MultiValueMap<String, Object>> httpEntity = new HttpEntity<>(body, headers);

      // Flask 호출
      ResponseEntity<String> response = restTemplate.exchange(
          aiForecastUrl,
          HttpMethod.POST,
          httpEntity,
          String.class
      );

      if (!response.getStatusCode().is2xxSuccessful()) {
        throw new FlaskPredictException("Flask 예측 서버 오류: " + response.getStatusCode());
      }

      // 응답 파싱
      JsonNode root = objectMapper.readTree(response.getBody());
      if (!root.path("success").asBoolean()) {
        throw new FlaskPredictException("Flask 응답 실패: " + root.path("error").asText());
      }

      ForecastRawResult[] rawResults = objectMapper.treeToValue(
          root.path("data"), ForecastRawResult[].class);

      List<String> insuranceCodes = Arrays.stream(rawResults)
          .map(ForecastRawResult::getInsuranceCode)
          .distinct()
          .toList();

      Map<String, Product> productMap = productRepo
          .findByInsuranceCodeIn(insuranceCodes).stream()
          .collect(Collectors.toMap(Product::getInsuranceCode, p -> p));

      // 매핑
      return Arrays.stream(rawResults).map(rawResult -> {
        Product product = productMap.get(rawResult.getInsuranceCode());
        int quantity = (rawResult.getPredictedQuantity() != null)
            ? rawResult.getPredictedQuantity()
            : 0;
        BigDecimal unitPrice = (product != null) ? product.getUnitPrice() : null;
        BigDecimal subtotalPrice = (product != null && unitPrice != null)
            ? unitPrice.multiply(BigDecimal.valueOf(quantity))
            : null;

        return ForecastProduct.builder()
            .productId(product != null ? product.getProductId() : null)
            .productName(rawResult.getProductName())
            .insuranceCode(rawResult.getInsuranceCode())
            .manufacturer(product != null ? product.getManufacturer() : null)
            .productImgUrl(product != null ? product.getProductImgUrl() : null)
            .unitPrice(unitPrice)
            .quantity(quantity)
            .subtotalPrice(subtotalPrice)
            .build();
      }).toList();

    } catch (Exception e) {
      throw new FlaskPredictException("예측 실패: " + e.getMessage());
    }
  }
}
