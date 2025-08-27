// 기본 응답
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalPages: number;
  totalElements: number;
  currentPage: number;
}
