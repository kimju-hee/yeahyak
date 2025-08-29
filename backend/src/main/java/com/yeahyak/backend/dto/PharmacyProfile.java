package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Region;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyProfile {

  private Long pharmacyId;
  private String pharmacyName;
  private String bizRegNo;
  private String representativeName;
  private String postcode;
  private String address;
  private String detailAddress;
  private Region region;
  private String contact;
  private BigDecimal balance;
}
