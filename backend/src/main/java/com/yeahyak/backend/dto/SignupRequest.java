package com.yeahyak.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

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

    private String detailAddress;

    @NotBlank
    private String contact;
}
