package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Region;
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
public class PharmacyUpdateRequest {

  @Size(max = 100)
  private String pharmacyName;

  @Size(max = 45)
  private String representativeName;

  @Size(max = 20)
  private String postcode;

  @Size(max = 255)
  private String address;

  @Size(max = 255)
  private String detailAddress;

  private Region region;

  @Size(max = 20)
  @Pattern(regexp = "^\\d{2,3}-\\d{3,4}-\\d{4}$", message = "연락처 형식이 올바르지 않습니다.")
  private String contact;
}
