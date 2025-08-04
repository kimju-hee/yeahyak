package com.yeahyak.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserInfo {
    private Long userId;
    private String email;
    private int point;
    private String role;
}
