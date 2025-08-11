package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.HqTransactionType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hq_stock_transactions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class HqStockTransaction {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hq_stock_id", nullable = false)
    private HqStock hqStock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HqTransactionType type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 주문/반품 참조는 느슨하게(필요 시 FK 매핑 확장)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "return_id")
    private Long returnId;
}
