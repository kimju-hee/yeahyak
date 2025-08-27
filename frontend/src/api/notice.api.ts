import { NOTICE_ENDPOINT } from '../constants';
import type {
  NoticeCreateReq,
  NoticeCreateResponse,
  NoticeDetailResponse,
  NoticeFileUpdateReq,
  NoticeListParams,
  NoticeListResponse,
  NoticeUpdateReq,
} from '../types';
import { instance } from './client';

// 공지사항 생성
export const createNotice = async (data: NoticeCreateReq): Promise<NoticeCreateResponse> => {
  const formData = new FormData();
  formData.append('notice', JSON.stringify(data.notice));
  if (data.file) formData.append('file', data.file);
  const response = await instance.post(NOTICE_ENDPOINT.CREATE, formData);
  console.log('📢 공지사항 생성 응답:', response);
  return response.data;
};

// 공지사항 목록 조회
export const getNotices = async (params?: NoticeListParams): Promise<NoticeListResponse> => {
  const response = await instance.get(NOTICE_ENDPOINT.LIST, { params });
  console.log('📢 공지사항 목록 조회 응답:', response);
  return response.data;
};

// 최근 공지사항 목록 조회
export const getLatestNotices = async (): Promise<NoticeListResponse> => {
  const response = await instance.get(NOTICE_ENDPOINT.LATEST_LIST);
  console.log('📢 최근 공지사항 목록 조회 응답:', response);
  return response.data;
};

// 공지사항 상세 조회
export const getNotice = async (noticeId: number): Promise<NoticeDetailResponse> => {
  const response = await instance.get(NOTICE_ENDPOINT.DETAIL(noticeId));
  console.log('📢 공지사항 상세 조회 응답:', response);
  return response.data;
};

// 공지사항 수정
export const updateNotice = async (noticeId: number, data: NoticeUpdateReq) => {
  const response = await instance.patch(NOTICE_ENDPOINT.UPDATE(noticeId), data);
  console.log('📢 공지사항 수정 응답:', response);
  return response.data;
};

// 공지사항 첨부파일 수정
export const updateFile = async (noticeId: number, data: NoticeFileUpdateReq) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await instance.post(NOTICE_ENDPOINT.FILE_UPDATE(noticeId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('📢 공지사항 첨부파일 수정 응답:', response);
  return response.data;
};

// 공지사항 삭제
export const deleteNotice = async (noticeId: number) => {
  const response = await instance.delete(NOTICE_ENDPOINT.DELETE(noticeId));
  console.log('📢 공지사항 삭제 응답:', response);
  return response.data;
};

// 공지사항 첨부파일 삭제
export const deleteFile = async (noticeId: number) => {
  const response = await instance.delete(NOTICE_ENDPOINT.FILE_DELETE(noticeId));
  console.log('📢 공지사항 첨부파일 삭제 응답:', response);
  return response.data;
};
