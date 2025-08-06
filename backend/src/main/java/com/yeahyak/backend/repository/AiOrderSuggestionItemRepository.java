package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.AiOrderSuggestionItem;
import com.yeahyak.backend.entity.AiOrderSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiOrderSuggestionItemRepository extends JpaRepository<AiOrderSuggestionItem, Long> {

    List<AiOrderSuggestionItem> findBySuggestion(AiOrderSuggestion suggestion);
}
