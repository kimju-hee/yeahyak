package com.yeahyak.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeRequest {

  @NotBlank
  @Size(min = 8, max = 64)
  private String currentPassword;

  @NotBlank
  @Size(min = 8, max = 64)
  private String newPassword;
}
