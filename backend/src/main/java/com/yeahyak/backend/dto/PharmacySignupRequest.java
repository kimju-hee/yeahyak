package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Region;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PharmacySignupRequest {

  @NotBlank
  @Email
  private String email;

  @NotBlank
  @Size(min = 8, max = 64)
  private String password;

  @NotBlank
  private String pharmacyName;

  @NotBlank
  @Pattern(regexp = "^\\d{3}-\\d{2}-\\d{5}$", message = "사업자등록번호 형식이 올바르지 않습니다.")
  private String bizRegNo;

  @NotBlank
  private String representativeName;

  @NotBlank
  private String postcode;

  @NotBlank
  private String address;

  private String detailAddress;

  @NotNull
  private Region region;

  @NotBlank
  @Pattern(regexp = "^\\d{2,3}-\\d{3,4}-\\d{4}$", message = "연락처 형식이 올바르지 않습니다.")
  private String contact;
}
