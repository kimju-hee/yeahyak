package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.BalanceTxType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * BalanceTx Entity representing a balance transaction for a pharmacy.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "balance_txs")
public class BalanceTx {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "balance_tx_id")
  private Long balanceTxId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "pharmacy_id", nullable = false)
  private Pharmacy pharmacy;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 45)
  private BalanceTxType type;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal amount;

  @Column(name = "balance_after", nullable = false, precision = 10, scale = 2)
  private BigDecimal balanceAfter;

  @CreationTimestamp // 생성 시각 자동 저장
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;
}
