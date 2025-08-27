package com.yeahyak.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatRequest {
    private Long userId;

    @JsonAlias({ "question", "query" })
    private String question;

    private ChatType chatType;   // enum 사용

    private List<MessageDto> history;
}
