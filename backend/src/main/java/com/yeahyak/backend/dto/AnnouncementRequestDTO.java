package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.AnnouncementType;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AnnouncementRequestDTO {
    private AnnouncementType type;
    private String title;
    private String content;
}