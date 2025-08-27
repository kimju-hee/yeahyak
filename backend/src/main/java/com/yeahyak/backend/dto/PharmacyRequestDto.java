package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Status;

import java.time.LocalDateTime;

public record PharmacyRequestDto(
        Long id,
        Long pharmacyId,
        LocalDateTime requestedAt,
        Status status,
        LocalDateTime reviewedAt
) {}