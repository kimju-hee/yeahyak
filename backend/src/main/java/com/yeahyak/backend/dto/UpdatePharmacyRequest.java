package com.yeahyak.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePharmacyRequest {

    @NotBlank
    private String pharmacyName;

    @NotBlank
    private String representativeName;

    @NotBlank
    private String address;

    private String phoneNumber;
}
