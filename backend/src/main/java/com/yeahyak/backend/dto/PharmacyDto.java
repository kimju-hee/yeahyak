package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Status;

public record PharmacyDto(
        Long pharmacyId,
        Long userId,
        String pharmacyName,
        String bizRegNo,
        String representativeName,
        String postcode,
        String address,
        String detailAddress,
        String contact,
        Status status
) {}