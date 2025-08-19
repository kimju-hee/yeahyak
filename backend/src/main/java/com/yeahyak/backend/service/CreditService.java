package com.yeahyak.backend.service;

import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.CreditStatus;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Map<String, Object>> getPendingCredits(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // 음수 포인트 사용자 & 미정산 사용자 둘 다 조회
        List<User> a = userRepository.findByPointLessThan(0);
        List<User> b = userRepository.findByCreditStatus(CreditStatus.SETTLEMENT_REQUIRED);

        Map<Long, User> merged = new LinkedHashMap<>();
        a.forEach(u -> merged.put(u.getUserId(), u));
        b.forEach(u -> merged.put(u.getUserId(), u));

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : merged.values()) {
            var ph = pharmacyRepository.findByUser(u).orElse(null);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", u.getUserId());
            row.put("email", u.getEmail());
            row.put("pharmacyName", ph != null ? ph.getPharmacyName() : null);
            row.put("point", u.getPoint());
            row.put("creditStatus", u.getCreditStatus().name());
            result.add(row);
        }

        // 수동으로 페이지네이션 적용
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), result.size());
        List<Map<String, Object>> pageContent = result.subList(start, end);

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

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", userId);
        data.put("beforePoint", before);
        data.put("settledAmount", settled);
        data.put("afterPoint", 0);
        data.put("creditStatus", u.getCreditStatus().name());
        return data;
    }
}
