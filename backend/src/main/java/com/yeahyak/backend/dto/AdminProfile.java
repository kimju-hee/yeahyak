package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Department;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfile {

  private Long adminId;
  private String adminName;
  private Department department;
}
