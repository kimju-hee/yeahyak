package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.InventoryDivision;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_history")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryDivision division;   // OUT / IN / RETURN_IN

    @Column(nullable = false)
    private Integer quantity;             // 변동(또는 요청) 수량

    @Column(nullable = false)
    private Integer stock;                // 기록 시점의 재고 스냅샷

    @Column(length = 255)
    private String note;                  // 비고(약국명 등)

    @CreationTimestamp
    private LocalDateTime createdAt;      // 날짜
}
