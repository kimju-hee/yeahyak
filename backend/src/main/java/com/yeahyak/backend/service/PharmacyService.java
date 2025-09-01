package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.PharmacyListResponse;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.repository.PharmacyRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PharmacyService {

  private final PharmacyRepository pharmacyRepository;

  @Transactional(readOnly = true)
  public Page<PharmacyListResponse> getPharmacies(
      Boolean unsettled, Region region, String keyword, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size);
    Page<Pharmacy> pharmacies = pharmacyRepository.findByUnsettledAndRegionAndPharmacyName(
        unsettled, region, keyword, pageable
    );

    List<Long> pharmacyIds = pharmacies.stream().map(Pharmacy::getPharmacyId).toList();
    final Map<Long, LocalDateTime> latestSettlementMap = new HashMap<>();
    if (!pharmacyIds.isEmpty()) {
      List<PharmacyRepository.PharmacyLatestSettlementProjection> projections =
          pharmacyRepository.findLatestSettlementDatesByPharmacyIds(pharmacyIds,
              BalanceTxType.SETTLEMENT);
      for (PharmacyRepository.PharmacyLatestSettlementProjection projection : projections) {
        latestSettlementMap.put(projection.getPharmacyId(), projection.getLatestSettlementAt());
      }
    }

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
        .balance(pharmacy.getBalance())
        .latestSettlementAt(latestSettlementMap.get(pharmacy.getPharmacyId()))
        .build());
  }
}
