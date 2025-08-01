package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.PointRequestDto;
import com.yeahyak.backend.entity.Point;
import com.yeahyak.backend.entity.PointStatus;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.repository.PointRepository;
import com.yeahyak.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PointService {

    private final PointRepository pointRepository;
    private final UserRepository userRepository;

    public void requestPointCharge(PointRequestDto pointRequestDto) {
        User user = userRepository.findById(pointRequestDto.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        Point point = new Point();
        point.setUser(user);
        point.setAmount(pointRequestDto.getAmount());
        point.setPointStatus(PointStatus.REQUESTED);
        point.setRequestedAt(LocalDateTime.now());

        pointRepository.save(point);
    }

    public void approvePointCharge(Long pointId) {
        Point point = pointRepository.findById(pointId)
                .orElseThrow(() -> new RuntimeException("요청 없음"));

        if (point.getPointStatus() != PointStatus.REQUESTED)
            throw new RuntimeException("이미 처리된 요청입니다.");

        point.setPointStatus(PointStatus.APPROVED);

        User user = point.getUser();
        user.setPoint(user.getPoint() + point.getAmount());

        pointRepository.save(point);
        userRepository.save(user);
    }

    public void rejectPointCharge(Long pointId) {
        Point point = pointRepository.findById(pointId)
                .orElseThrow(() -> new RuntimeException("요청 없음"));

        if (point.getPointStatus() != PointStatus.REQUESTED)
            throw new RuntimeException("이미 처리된 요청입니다.");

        point.setPointStatus(PointStatus.REJECTED);
        pointRepository.save(point);
    }
}
