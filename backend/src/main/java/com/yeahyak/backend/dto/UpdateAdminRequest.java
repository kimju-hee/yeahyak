package com.yeahyak.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UpdateAdminRequest {
    private Long adminId;
    private String adminName;
    private String department;
}
