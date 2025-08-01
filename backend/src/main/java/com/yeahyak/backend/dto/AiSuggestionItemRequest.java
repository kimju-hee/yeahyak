package com.yeahyak.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiSuggestionItemRequest {
    private Long productId;
    private Integer quantity;
}
