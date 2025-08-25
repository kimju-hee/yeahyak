package com.yeahyak.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

  private boolean success;
  private T data;

  private Integer totalPages;
  private Long totalElements;
  private Integer currentPage;

  public static <T> ApiResponse<T> ok(T data) {
    return ApiResponse.<T>builder()
        .success(true)
        .data(data)
        .build();
  }

  public static <T> ApiResponse<List<T>> withPagination(Page<T> page) {
    return ApiResponse.<List<T>>builder()
        .success(true)
        .data(page.getContent())
        .totalPages(page.getTotalPages())
        .totalElements(page.getTotalElements())
        .currentPage(page.getNumber())
        .build();
  }
}
