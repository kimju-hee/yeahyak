package com.yeahyak.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UpdatePharmacyRequest {

    @NotBlank
    private String pharmacyName;

    @NotBlank
    private String bizRegNo;

    @NotBlank
    private String representativeName;

    @NotBlank
    private String postcode;

    @NotBlank
    private String address;

    @NotBlank
    private String detailAddress;

    @NotBlank
    private String contact;

    @NotBlank
    private String status;
}
