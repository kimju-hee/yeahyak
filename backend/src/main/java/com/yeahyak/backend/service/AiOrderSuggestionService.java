package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.AiSuggestionItemRequest;
import com.yeahyak.backend.dto.AiSuggestionRequest;
import com.yeahyak.backend.entity.AiOrderSuggestion;
import com.yeahyak.backend.entity.AiOrderSuggestionItem;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.repository.AiOrderSuggestionItemRepository;
import com.yeahyak.backend.repository.AiOrderSuggestionRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AiOrderSuggestionService {

    private final PharmacyRepository pharmacyRepository;
    private final ProductRepository productRepository;
    private final AiOrderSuggestionRepository suggestionRepository;
    private final AiOrderSuggestionItemRepository suggestionItemRepository;

    @Transactional
    public void saveSuggestion(AiSuggestionRequest request) {
        Pharmacy pharmacy = pharmacyRepository.findById(request.getPharmacyId())
                .orElseThrow(() -> new IllegalArgumentException("약국을 찾을 수 없습니다."));

        AiOrderSuggestion suggestion = AiOrderSuggestion.builder()
                .pharmacy(pharmacy)
                .createdAt(LocalDateTime.now())
                .isApplied(false)
                .build();

        suggestionRepository.save(suggestion);

        for (AiSuggestionItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("제품을 찾을 수 없습니다."));

            AiOrderSuggestionItem item = AiOrderSuggestionItem.builder()
                    .suggestion(suggestion)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .build();

            suggestionItemRepository.save(item);
        }
    }
}
