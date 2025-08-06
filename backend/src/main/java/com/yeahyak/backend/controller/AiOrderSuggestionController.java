package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.AiSuggestionRequest;
import com.yeahyak.backend.service.AiOrderSuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai-suggestions")
public class AiOrderSuggestionController {

    private final AiOrderSuggestionService suggestionService;

    @PostMapping
    public ResponseEntity<String> saveSuggestion(@RequestBody AiSuggestionRequest request) {
        suggestionService.saveSuggestion(request);
        return ResponseEntity.ok("AI 발주 추천이 저장되었습니다.");
    }
}
