package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Region;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyUpdateRequest {

  private String pharmacyName;
  private String representativeName;
  private String postcode;
  private String address;
  private String detailAddress;
  private Region region;
  @Pattern(regexp = "^\\d{2,3}-\\d{3,4}-\\d{4}$", message = "연락처 형식이 올바르지 않습니다.")
  private String contact;
}
