package com.yeahyak.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PharmacyProfile {
    private Long pharmacyId;
    private Long userId;
    private String pharmacyName;
    private String bizRegNo;
    private String representativeName;
    private String postcode;
    private String address;
    private String detailAddress;
    private String contact;
    private String status;
}
