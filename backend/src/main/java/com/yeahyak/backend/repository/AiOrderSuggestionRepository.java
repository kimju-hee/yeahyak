package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.AiOrderSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiOrderSuggestionRepository extends JpaRepository<AiOrderSuggestion, Long> {

    List<AiOrderSuggestion> findByPharmacyPharmacyId(Long pharmacyId);

    List<AiOrderSuggestion> findByIsAppliedFalse();
}
