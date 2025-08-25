package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.PharmacyListResponse;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.repository.BalanceTxRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
public class PharmacyService {

  private final PharmacyRepository pharmacyRepo;
  private final BalanceTxRepository balanceTxRepo;

  @Transactional(readOnly = true)
  public Page<PharmacyListResponse> getPharmacies(
      Boolean unpaidCreditFilter, Region region, String keyword, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    Page<Pharmacy> pharmacies = pharmacyRepo.findByUnpaidCreditAndRegionAndPharmacyName(
        unpaidCreditFilter, region, keyword, pageable
    );
    List<Long> pharmacyIds = pharmacies.stream()
        .map(Pharmacy::getPharmacyId)
        .toList();
    final Map<Long, LocalDateTime> latestSettlementMap = pharmacyIds.isEmpty()
        ? Collections.emptyMap()
        : balanceTxRepo.findLatestSettlementDateByPharmacyIds(pharmacyIds, BalanceTxType.SETTLEMENT)
            .stream()
            .collect(Collectors.toMap(
                BalanceTxRepository.PharmacyLatestSettlementProjection::getPharmacyId,
                BalanceTxRepository.PharmacyLatestSettlementProjection::getLatestSettlementAt
            ));
    return pharmacies.map(pharmacy -> PharmacyListResponse.builder()
        .pharmacyId(pharmacy.getPharmacyId())
        .pharmacyName(pharmacy.getPharmacyName())
        .bizRegNo(pharmacy.getBizRegNo())
        .representativeName(pharmacy.getRepresentativeName())
        .postcode(pharmacy.getPostcode())
        .address(pharmacy.getAddress())
        .detailAddress(pharmacy.getDetailAddress())
        .region(pharmacy.getRegion())
        .contact(pharmacy.getContact())
        .outstandingBalance(pharmacy.getOutstandingBalance())
        .latestSettlementAt(latestSettlementMap.get(pharmacy.getPharmacyId()))
        .build());
  }
}
