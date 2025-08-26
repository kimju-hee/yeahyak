package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.BalanceTxListResponse;
import com.yeahyak.backend.dto.SettlementRequest;
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

@Service
@RequiredArgsConstructor
public class BalanceTxService {

  private final PharmacyRepository pharmacyRepo;
  private final BalanceTxRepository balanceTxRepo;

  @Transactional
  public void createBalanceTx(Long pharmacyId, BalanceTxType type, BigDecimal amount) {
    Pharmacy pharmacy = pharmacyRepo.findById(pharmacyId)
        .orElseThrow(() -> new RuntimeException("가맹점 정보를 찾을 수 없습니다."));

    BigDecimal before = pharmacy.getOutstandingBalance();
    BigDecimal after;

    switch (type) {
      case ORDER -> {
        balanceTxRepo.increaseBalance(pharmacyId, amount);
        after = before.add(amount);
      }
      case RETURN, CANCEL -> {
        balanceTxRepo.decreaseBalance(pharmacyId, amount);
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
    balanceTxRepo.save(balanceTx);
  }

  @Transactional(readOnly = true)
  public Page<BalanceTxListResponse> getBalanceTxs(
      Long pharmacyId, BalanceTxType type, LocalDateTime start, LocalDateTime end,
      int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return balanceTxRepo.findByPharmacy_PharmacyIdAndTypeAndCreatedAtBetween(
        pharmacyId, type, start, end, pageable
    ).map(balanceTx -> BalanceTxListResponse.builder()
        .balanceTxId(balanceTx.getBalanceTxId())
        .pharmacyId(balanceTx.getPharmacy().getPharmacyId())
        .type(balanceTx.getType())
        .amount(balanceTx.getAmount())
        .balanceAfter(balanceTx.getBalanceAfter())
        .createdAt(balanceTx.getCreatedAt())
        .build());
  }

  @Transactional
  public SettlementResponse settlement(SettlementRequest req) {
    Pharmacy pharmacy = pharmacyRepo.findById(req.getPharmacyId())
        .orElseThrow(() -> new RuntimeException("가맹점 정보를 찾을 수 없습니다."));
    if (pharmacy.getOutstandingBalance().compareTo(BigDecimal.ZERO) <= 0) {
      throw new RuntimeException("정산할 외상 잔액이 없습니다.");
    }

    BigDecimal before = pharmacy.getOutstandingBalance();
    BigDecimal amount = before;
    BigDecimal after = BigDecimal.ZERO;

    balanceTxRepo.decreaseBalance(pharmacy.getPharmacyId(), amount);

    BalanceTx balanceTx = BalanceTx.builder()
        .pharmacy(pharmacy)
        .type(BalanceTxType.SETTLEMENT)
        .amount(amount)
        .balanceAfter(after)
        .build();
    balanceTxRepo.save(balanceTx);

    return SettlementResponse.builder()
        .balanceTxId(balanceTx.getBalanceTxId())
        .pharmacyId(pharmacy.getPharmacyId())
        .amount(amount)
        .balanceBefore(before)
        .balanceAfter(after)
        .createdAt(balanceTx.getCreatedAt())
        .build();
  }
}
