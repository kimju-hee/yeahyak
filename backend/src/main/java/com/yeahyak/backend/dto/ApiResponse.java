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
  private PageInfo page;

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
        .page(new PageInfo(page))
        .build();
  }

  @Getter
  @AllArgsConstructor
  public static class PageInfo {

    private int totalPages;
    private long totalElements;
    private int currentPage;

    public PageInfo(Page<?> page) {
      this.totalPages = page.getTotalPages();
      this.totalElements = page.getTotalElements();
      this.currentPage = page.getNumber();
    }
  }
}
