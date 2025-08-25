package com.yeahyak.backend.deprecated;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
