export interface Announcement {
  announcementId: number;
  type: AnnouncementType;
  title: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}
export type AnnouncementType = keyof typeof ANNOUNCEMENT_TYPE;

export const ANNOUNCEMENT_TYPE = {
  NOTICE: '공지사항',
  LAW: '법령',
  EPIDEMIC: '감염병',
  NEW_PRODUCT: '신제품',
} as const;

export interface AnnouncementRequest {
  type: AnnouncementType;
  title: string;
  content: string;
  attachmentUrl?: string;
}
