package com.yeahyak.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointRequestDto {
    private Long userId;
    private int amount;
}
