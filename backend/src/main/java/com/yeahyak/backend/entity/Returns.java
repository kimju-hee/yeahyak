package com.yeahyak.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "returns")
@Getter @Setter
@NoArgsConstructor
public class Returns {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long returnId;

    @ManyToOne
    @JoinColumn(name = "pharmacy_id", nullable = false)
    private Pharmacy pharmacy;

    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private int totalPrice;

    @Enumerated(EnumType.STRING)
    private ReturnStatus status;

    private LocalDateTime updatedAt;
}
