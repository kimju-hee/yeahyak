import type { ApiResponse, NoticeType, PaginatedResponse } from '.';

export interface NoticeCreateRequest {
  type: NoticeType;
  title: string;
  content: string;
}

export interface NoticeCreateRequestWithFile {
  notice: NoticeCreateRequest;
  file?: File;
}

export interface NoticeCreate {
  noticeId: number;
}

export interface NoticeListParams {
  type: NoticeType;
  keyword?: string; // 제목 또는 내용
  scope?: 'TITLE' | 'CONTENT'; // 검색 범위
  page?: number;
  size?: number;
}

export interface NoticeList {
  noticeId: number;
  type: NoticeType;
  title: string;
  createdAt: string;
  viewCount: number;
}

export interface NoticeDetail {
  noticeId: number;
  type: NoticeType;
  title: string;
  content: string;
  fileName?: string;
  createdAt: string;
  updatedAt?: string;
  viewCount: number;
}

export interface NoticeUpdateRequest {
  title: string;
  content: string;
  removeFile: boolean;
}

export interface NoticeUpdateRequestWithFile {
  notice: NoticeUpdateRequest;
  file?: File;
}

export type NoticeCreateResponse = ApiResponse<NoticeCreate>;
export type NoticeListResponse = PaginatedResponse<NoticeList>;
export type NoticeLatestListResponse = ApiResponse<NoticeList[]>;
export type NoticeDetailResponse = ApiResponse<NoticeDetail>;
