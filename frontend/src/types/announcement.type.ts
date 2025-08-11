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

export interface AnnouncementRequest {
  type: AnnouncementType;
  title: string;
  content: string;
  attachmentUrl?: string;
}
