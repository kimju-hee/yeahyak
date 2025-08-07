package com.yeahyak.backend.dto;

import com.yeahyak.backend.entity.enums.AnnouncementType;
import lombok.Data;

@Data
public class AnnouncementRequestDTO {
    private AnnouncementType type;
    private String title;
    private String content;
    private String attachmentUrl;
}