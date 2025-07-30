package com.yeahyak.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "returnitems")
@Getter
@Setter
@NoArgsConstructor
public class ReturnItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long returnItemId;

    @ManyToOne
    @JoinColumn(name = "return_id", nullable = false)
    private Returns returns;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private int quantity;
    private int unitPrice;
    private int subtotalPrice;
}