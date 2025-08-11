package com.yeahyak.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hq_stocks")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class HqStock {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "last_inbounded_at")
    private LocalDateTime lastInboundedAt;

    @Column(name = "last_outbounded_at")
    private LocalDateTime lastOutboundedAt;
}
