package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.Department;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateRequest {

  @Size(max = 45)
  private String adminName;

  private Department department;
}
