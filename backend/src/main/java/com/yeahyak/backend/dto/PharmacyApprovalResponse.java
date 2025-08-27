package com.yeahyak.backend.dto;

public record PharmacyApprovalResponse(
        PharmacyRequestDto request,
        PharmacyDto pharmacy
) {}
