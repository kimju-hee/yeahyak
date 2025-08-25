package com.yeahyak.backend.dto;

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
public class PharmacyLoginResponse {

  private String accessToken;
  private UserInfo user;
  private PharmacyProfile profile;
}
