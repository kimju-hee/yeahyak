package com.yeahyak.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AiSuggestionRequest {
    private Long pharmacyId;
    private List<AiSuggestionItemRequest> items;
}
