import { ANNOUNCEMENT_ENDPOINT } from '../constants';
import type {
  AnnouncementCreateRequest,
  AnnouncementCreateResponse,
  AnnouncementDeleteResponse,
  AnnouncementDetailResponse,
  AnnouncementListParams,
  AnnouncementListResponse,
  AnnouncementUpdateRequest,
  AnnouncementUpdateResponse,
} from '../types';
import { instance } from './client';

// 공지사항 생성
export const createAnnouncement = async (
  data: AnnouncementCreateRequest,
): Promise<AnnouncementCreateResponse> => {
  const formData = new FormData();
  formData.append('announcement', JSON.stringify(data.announcement));
  if (data.file) formData.append('file', data.file);
  const response = await instance.post(ANNOUNCEMENT_ENDPOINT.CREATE, formData);
  console.log('📢 공지사항 생성 응답:', response);
  return response.data;
};

// 공지사항 목록 조회
export const getAnnouncements = async (
  params?: AnnouncementListParams,
): Promise<AnnouncementListResponse> => {
  const response = await instance.get(ANNOUNCEMENT_ENDPOINT.LIST, { params });
  console.log('📢 공지사항 목록 조회 응답:', response);
  return response.data;
};

// 공지사항 상세 조회
export const getAnnouncement = async (
  announcementId: number,
): Promise<AnnouncementDetailResponse> => {
  const response = await instance.get(ANNOUNCEMENT_ENDPOINT.DETAIL(announcementId));
  console.log('📢 공지사항 상세 조회 응답:', response);
  return response.data;
};

// 공지사항 수정
export const updateAnnouncement = async (
  announcementId: number,
  data: AnnouncementUpdateRequest,
): Promise<AnnouncementUpdateResponse> => {
  const formData = new FormData();
  formData.append('announcement', JSON.stringify(data.announcement));
  if (data.file) formData.append('file', data.file);
  const response = await instance.put(ANNOUNCEMENT_ENDPOINT.UPDATE(announcementId), formData);
  console.log('📢 공지사항 수정 응답:', response);
  return response.data;
};

// 공지사항 삭제
export const deleteAnnouncement = async (
  announcementId: number,
): Promise<AnnouncementDeleteResponse> => {
  const response = await instance.delete(ANNOUNCEMENT_ENDPOINT.DELETE(announcementId));
  console.log('📢 공지사항 삭제 응답:', response);
  return response.data;
};
