import type { NoticeType, NoticeTypeTextMap } from '../types';

export const NOTICE_ENDPOINT = {
  CREATE: '/notices',
  LIST: '/notices',
  LATEST_LIST: '/notices/latest',
  DETAIL: (noticeId: number) => `/notices/${noticeId}`,
  UPDATE: (noticeId: number) => `/notices/${noticeId}`,
  DELETE: (noticeId: number) => `/notices/${noticeId}`,
  UPDATE_FILE: (noticeId: number) => `/notices/${noticeId}/attachment`,
  DELETE_FILE: (noticeId: number) => `/notices/${noticeId}/attachment`,
} as const;

export const NOTICE_TYPE_OPTIONS = [
  { value: 'GENERAL' as NoticeType, label: '안내' },
  { value: 'LAW' as NoticeType, label: '법령' },
  { value: 'EPIDEMIC' as NoticeType, label: '감염병' },
  { value: 'NEW_PRODUCT' as NoticeType, label: '신제품' },
] as const;

export const NOTICE_TYPE_TEXT: NoticeTypeTextMap = {
  GENERAL: '안내',
  LAW: '법령',
  EPIDEMIC: '감염병',
  NEW_PRODUCT: '신제품',
} as const;
