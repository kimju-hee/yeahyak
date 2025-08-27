package com.yeahyak.backend.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yeahyak.backend.dto.ForecastProductDto;
import com.yeahyak.backend.dto.ForecastRawResultDto;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.exception.FlaskPredictException;
import com.yeahyak.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;


import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class ForecastRequestService {

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();


    @Value("${ai.service.url}/forecast/order")
    private String forecastUrl;


    public List<ForecastProductDto> predictOrder(MultipartFile file) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());


            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);


            ResponseEntity<String> response = restTemplate.exchange(
                    forecastUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );


            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new FlaskPredictException("Flask 예측 서버 오류: " + response.getStatusCode());
            }


            JsonNode root = objectMapper.readTree(response.getBody());
            if (!root.path("success").asBoolean()) {
                throw new FlaskPredictException("Flask 응답 실패: " + root.path("error").asText());
            }


            ForecastRawResultDto[] rawResults = objectMapper.treeToValue(
                    root.path("data"), ForecastRawResultDto[].class);


            List<String> productCodes = Arrays.stream(rawResults)
                    .map(ForecastRawResultDto::getProductCode)
                    .distinct().toList();


            Map<String, Product> productMap = productRepository.findByProductCodeIn(productCodes).stream()
                    .collect(Collectors.toMap(Product::getProductCode, p -> p));


            return Arrays.stream(rawResults).map(r -> {
                Product p = productMap.get(r.getProductCode());
                return ForecastProductDto.builder()
                        .productId(p != null ? p.getProductId() : null)
                        .productName(r.getProductName())
                        .productCode(r.getProductCode())
                        .manufacturer(p != null ? p.getManufacturer() : null)
                        .unitPrice(p != null ? p.getUnitPrice() : null)
                        .quantity(r.getPredictedQuantity())
                        .subtotalPrice(p != null ?
                                p.getUnitPrice().multiply(BigDecimal.valueOf(r.getPredictedQuantity())) : null)
                        .productImgUrl(p != null ? p.getProductImgUrl() : null)
                        .build();
            }).toList();


        } catch (Exception e) {
            throw new FlaskPredictException("예측 실패: " + e.getMessage());
        }
    }
}