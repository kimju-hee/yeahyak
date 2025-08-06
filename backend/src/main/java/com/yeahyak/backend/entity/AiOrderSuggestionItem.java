package com.yeahyak.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_order_suggestion_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOrderSuggestionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long suggestionItemId;

    @ManyToOne
    @JoinColumn(name = "suggestion_id", nullable = false)
    private AiOrderSuggestion suggestion;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;
}
