import type { AnnouncementType, AnnouncementTypeTextMap } from '../types';

export const ANNOUNCEMENT_ENDPOINT = {
  CREATE: '/announcements',
  LIST: '/announcements',
  DETAIL: (announcementId: number) => `/announcements/${announcementId}`,
  UPDATE: (announcementId: number) => `/announcements/${announcementId}`,
  DELETE: (announcementId: number) => `/announcements/${announcementId}`,
} as const;

export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { value: 'NOTICE' as AnnouncementType, label: '안내' },
  { value: 'LAW' as AnnouncementType, label: '법령' },
  { value: 'EPIDEMIC' as AnnouncementType, label: '감염병' },
  { value: 'NEW_PRODUCT' as AnnouncementType, label: '신제품' },
] as const;

export const ANNOUNCEMENT_TYPE_TEXT: AnnouncementTypeTextMap = {
  NOTICE: '안내',
  LAW: '법령',
  EPIDEMIC: '감염병',
  NEW_PRODUCT: '신제품',
} as const;
