package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.PharmacyRequestStatus;
import com.yeahyak.backend.entity.enums.Region;
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
public class PharmacyRequestDetailResponse {

  private Long pharmacyRequestId;
  private Long userId;
  private String email;
  private String pharmacyName;
  private String bizRegNo;
  private String representativeName;
  private String postcode;
  private String address;
  private String detailAddress;
  private Region region;
  private String contact;
  private PharmacyRequestStatus status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
