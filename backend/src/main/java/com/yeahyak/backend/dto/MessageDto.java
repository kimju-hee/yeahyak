package com.yeahyak.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class MessageDto {
    /**
     * 메시지 발신자 타입
     * - "human" 또는 "ai"
     */
    private String type;

    /**
     * 메시지 내용
     */
    private String content;
}
