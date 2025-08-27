package com.yeahyak.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSignupRequest {

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

    @NotBlank
    private String adminName;

    @NotBlank
    private String department;
}
