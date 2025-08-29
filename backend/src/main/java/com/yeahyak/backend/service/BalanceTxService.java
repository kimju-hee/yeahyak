package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.BalanceTxResponse;
import com.yeahyak.backend.dto.SettlementResponse;
import com.yeahyak.backend.entity.BalanceTx;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import com.yeahyak.backend.repository.BalanceTxRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 외상 거래 내역과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class BalanceTxService {

  private final BalanceTxRepository balanceTxRepository;
  private final PharmacyRepository pharmacyRepository;

  /**
   * 외상 거래 내역을 생성하고, 해당 가맹점의 외상 잔액을 업데이트합니다.
   */
  @Transactional
  public Long createBalanceTx(Long pharmacyId, BalanceTxType type, BigDecimal amount) {
    Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
        .orElseThrow(() -> new RuntimeException("약국 정보를 찾을 수 없습니다."));

    BigDecimal before = pharmacy.getBalance();
    BigDecimal after;

    switch (type) {
      case ORDER -> {
        int updated = pharmacyRepository.increaseBalance(pharmacyId, amount);
        if (updated == 0) {
          throw new RuntimeException("외상 한도를 초과합니다.");
        }
        after = before.add(amount);
      }
      case RETURN, ORDER_CANCEL -> {
        pharmacyRepository.decreaseBalance(pharmacyId, amount);
        after = before.subtract(amount);
      }
      default -> throw new RuntimeException("잘못된 거래 유형입니다.");
    }

    BalanceTx balanceTx = BalanceTx.builder()
        .pharmacy(pharmacy)
        .type(type)
        .amount(amount)
        .balanceAfter(after)
        .build();
    balanceTxRepository.save(balanceTx);

    return balanceTx.getBalanceTxId();
  }

  /**
   * 특정 약국의 외상 거래 내역을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<BalanceTxResponse> getBalanceTxs(
      Long pharmacyId, BalanceTxType type, LocalDateTime start, LocalDateTime end,
      int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return balanceTxRepository.findByPharmacyIdAndTypeAndCreatedAtBetween(
        pharmacyId, type, start, end, pageable
    ).map(balanceTx -> BalanceTxResponse.builder()
        .balanceTxId(balanceTx.getBalanceTxId())
        .pharmacyId(pharmacyId)
        .type(type)
        .amount(balanceTx.getAmount())
        .balanceAfter(balanceTx.getBalanceAfter())
        .createdAt(balanceTx.getCreatedAt())
        .build());
  }

  /**
   * 특정 약국의 외상 잔액을 정산하고, 정산 내역을 기록합니다.
   */
  @Transactional
  public SettlementResponse settlement(Long pharmacyId) {
    Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
        .orElseThrow(() -> new RuntimeException("약국 정보를 찾을 수 없습니다."));
    if (pharmacy.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
      throw new RuntimeException("정산할 외상 잔액이 없습니다.");
    }

    BigDecimal before = pharmacy.getBalance();
    BigDecimal after = BigDecimal.ZERO;

    pharmacyRepository.decreaseBalance(pharmacyId, before);

    BalanceTx balanceTx = BalanceTx.builder()
        .pharmacy(pharmacy)
        .type(BalanceTxType.SETTLEMENT)
        .amount(before)
        .balanceAfter(after)
        .build();
    balanceTxRepository.save(balanceTx);

    return SettlementResponse.builder()
        .balanceTxId(balanceTx.getBalanceTxId())
        .pharmacyId(pharmacy.getPharmacyId())
        .amount(before)
        .balanceBefore(before)
        .balanceAfter(after)
        .createdAt(balanceTx.getCreatedAt())
        .build();
  }
}
