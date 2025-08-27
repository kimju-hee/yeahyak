package com.yeahyak.backend.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yeahyak.backend.dto.PendingCreditDto;
import com.yeahyak.backend.entity.CreditSettlement;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.CreditStatus;
import com.yeahyak.backend.repository.CreditSettlementRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class CreditService {
    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;
    private final CreditSettlementRepository creditSettlementRepository;

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<PendingCreditDto> getPendingCredits(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // 음수 포인트 사용자 & 미정산 사용자 둘 다 조회
        List<User> a = userRepository.findByPointLessThan(0);
        List<User> b = userRepository.findByCreditStatus(CreditStatus.SETTLEMENT_REQUIRED);

        Map<Long, User> merged = new LinkedHashMap<>();
        a.forEach(u -> merged.put(u.getUserId(), u));
        b.forEach(u -> merged.put(u.getUserId(), u));

        List<PendingCreditDto> result = new ArrayList<>();

        for (User u : merged.values()) {
            var ph = pharmacyRepository.findByUser(u).orElse(null);

            var settlements = creditSettlementRepository.findRecentByUser(u);
            String recentSettledDate = null;
            Integer recentSettledAmount = null;

            if (settlements != null && !settlements.isEmpty()) {
                var recent = settlements.get(0);
                recentSettledDate = recent.getSettledAt() != null ? recent.getSettledAt().toString() : null;
                recentSettledAmount = recent.getAmount();
            }

             Integer total = creditSettlementRepository.sumAmountByUser(u);
             if (total == null) total = 0;

             result.add(PendingCreditDto.builder()
                 .userId(u.getUserId())
                 .email(u.getEmail())
                 .pharmacyId(ph != null ? ph.getPharmacyId() : null)
                 .pharmacyName(ph != null ? ph.getPharmacyName() : null)
                 .point(u.getPoint())
                 .recentSettledDate(recentSettledDate)
                 .recentSettledAmount(recentSettledAmount)
                 .totalSettledAmount(total)
                 .creditStatus(u.getCreditStatus().name())
                 .build());
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), result.size());
        List<PendingCreditDto> pageContent = (start <= end) ? result.subList(start, end) : List.of();

        return new PageImpl<>(pageContent, pageable, result.size());  
    }

    @Transactional
    public Map<String, Object> approveSettlement(Long userId, String note) {
        User u = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        int before = u.getPoint();
        int settled = Math.abs(before);
        u.setPoint(0);
        u.setCreditStatus(CreditStatus.FULL);
        userRepository.save(u);
        // 정산 내역 저장
        if (settled > 0) {
            CreditSettlement cs = CreditSettlement.builder()
                .user(u)
                .amount(settled)
                .settledAt(java.time.LocalDateTime.now())
                .build();
            creditSettlementRepository.save(cs);
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", userId);
        data.put("beforePoint", before);
        data.put("settledAmount", settled);
        data.put("afterPoint", 0);
        data.put("creditStatus", u.getCreditStatus().name());
        return data;
    }
}
