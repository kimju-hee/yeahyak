package com.yeahyak.backend.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JinhoResponse<T> {
    private boolean success;
    private List<T> data;
    private int totalPages;
    private long totalElements;
    private int currentPage;
}
