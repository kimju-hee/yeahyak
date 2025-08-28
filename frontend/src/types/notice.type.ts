import type { ApiResponse, PaginatedResponse } from './api.type';

export const NOTICE_TYPE = {
  GENERAL: 'GENERAL',
  LAW: 'LAW',
  EPIDEMIC: 'EPIDEMIC',
  NEW_PRODUCT: 'NEW_PRODUCT',
} as const;
export type NoticeType = keyof typeof NOTICE_TYPE;
export type NoticeTypeTextMap = { [key in NoticeType]: string };

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

export interface NoticeDetail {
  noticeId: number;
  type: NoticeType;
  title: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NoticeListParams {
  type: NoticeType;
  keyword?: string;
  scope?: 'TITLE' | 'CONTENT';
  page?: number;
  size?: number;
}

export interface NoticeList {
  noticeId: number;
  type: NoticeType;
  title: string;
  createdAt: string;
}

export interface NoticeUpdateRequest {
  title: string;
  content: string;
}

export interface NoticeFileUpdateRequest {
  file: File;
}

export interface NoticeUpdateRequestWithFile {
  notice: NoticeUpdateRequest;
  file?: File;
}

export type NoticeCreateResponse = ApiResponse<NoticeCreate>;
export type NoticeListResponse = PaginatedResponse<NoticeList>;
export type NoticeLatestListResponse = ApiResponse<NoticeList[]>;
export type NoticeDetailResponse = ApiResponse<NoticeDetail>;
