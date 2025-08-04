package com.yeahyak.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdminProfile {
    private Long adminId;
    private Long userId;
    private String adminName;
    private String department;
}
