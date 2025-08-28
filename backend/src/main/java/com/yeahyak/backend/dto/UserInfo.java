package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {

  private Long userId;
  private String email;
  private UserRole role;
}
