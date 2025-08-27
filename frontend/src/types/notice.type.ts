import type { ApiResponse, PaginatedResponse } from './api.type';

export const NOTICE_TYPE = {
  GENERAL: 'GENERAL',
  LAW: 'LAW',
  EPIDEMIC: 'EPIDEMIC',
  NEW_PRODUCT: 'NEW_PRODUCT',
} as const;
export type NoticeType = keyof typeof NOTICE_TYPE;
export type NoticeTypeTextMap = { [key in NoticeType]: string };

export interface NoticeCreateReq {
  notice: NoticeJson;
  file?: File;
}

export interface NoticeJson {
  type: NoticeType;
  title: string;
  content: string;
}

export interface NoticeCreateRes {
  noticeId: number;
}

export interface NoticeDetailRes {
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

export interface NoticeListRes {
  noticeId: number;
  type: NoticeType;
  title: string;
  createdAt: string;
}

export interface NoticeUpdateReq {
  title: string;
  content: string;
}

export interface NoticeFileUpdateReq {
  file: File;
}

export type NoticeCreateResponse = ApiResponse<NoticeCreateRes>;
export type NoticeListResponse = PaginatedResponse<NoticeListRes>;
export type NoticeDetailResponse = ApiResponse<NoticeDetailRes>;
