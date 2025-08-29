package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Region;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyListResponse {

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
  private LocalDateTime latestSettlementAt;
}
