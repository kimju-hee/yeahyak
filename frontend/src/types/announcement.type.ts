import type { PaginatedResponse } from './api.type';

export interface Announcement {
  announcementId: number;
  type: AnnouncementType;
  title: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export const ANNOUNCEMENT_TYPE = {
  NOTICE: 'NOTICE',
  LAW: 'LAW',
  EPIDEMIC: 'EPIDEMIC',
  NEW_PRODUCT: 'NEW_PRODUCT',
} as const;
export type AnnouncementType = keyof typeof ANNOUNCEMENT_TYPE;
export type AnnouncementTypeTextMap = { [key in AnnouncementType]: string };

export interface AnnouncementJson {
  type: AnnouncementType;
  title: string;
  content: string;
}

export interface AnnouncementRequest {
  announcement: AnnouncementJson;
  file?: File;
}

export interface AnnouncementListParams {
  page?: number;
  size?: number;
  type?: AnnouncementType;
  keyword?: string;
}

export type AnnouncementCreateRequest = AnnouncementRequest;
export type AnnouncementUpdateRequest = AnnouncementRequest;

export type AnnouncementCreateResponse = PaginatedResponse<Announcement>;
export type AnnouncementListResponse = PaginatedResponse<Announcement>;
export type AnnouncementDetailResponse = PaginatedResponse<Announcement>;
export type AnnouncementUpdateResponse = PaginatedResponse<Announcement>;
export type AnnouncementDeleteResponse = PaginatedResponse<string>;
