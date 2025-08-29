import { NOTICE_ENDPOINT } from '../constants';
import type {
  NoticeCreateRequestWithFile,
  NoticeCreateResponse,
  NoticeDetailResponse,
  NoticeLatestListResponse,
  NoticeListParams,
  NoticeListResponse,
  NoticeUpdateRequestWithFile,
} from '../types';
import { instance } from './client';

// 공지사항 생성
export const createNotice = async (
  data: NoticeCreateRequestWithFile,
): Promise<NoticeCreateResponse> => {
  const formData = new FormData();
  formData.append('notice', new Blob([JSON.stringify(data.notice)], { type: 'application/json' }));
  if (data.file) formData.append('file', data.file);
  const response = await instance.post(NOTICE_ENDPOINT.CREATE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('📢 공지사항 생성 응답:', response);
  return response.data;
};

// 공지사항 목록 조회
export const getNotices = async (params: NoticeListParams): Promise<NoticeListResponse> => {
  const response = await instance.get(NOTICE_ENDPOINT.LIST, { params });

  console.log('📢 공지사항 목록 조회 응답:', response);
  return response.data;
};

// 최근 공지사항 목록 조회
export const getLatestNotices = async (): Promise<NoticeLatestListResponse> => {
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
export const updateNotice = async (
  noticeId: number,
  data: NoticeUpdateRequestWithFile,
): Promise<void> => {
  const formData = new FormData();
  formData.append('notice', new Blob([JSON.stringify(data.notice)], { type: 'application/json' }));
  if (data.file) formData.append('file', data.file);
  const response = await instance.patch(NOTICE_ENDPOINT.UPDATE(noticeId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('📢 공지사항 수정 응답:', response);
};

// 공지사항 삭제
export const deleteNotice = async (noticeId: number): Promise<void> => {
  const response = await instance.delete(NOTICE_ENDPOINT.DELETE(noticeId));

  console.log('📢 공지사항 삭제 응답:', response);
};

// 공지사항 첨부파일 다운로드
export const download = async (noticeId: number): Promise<void> => {
  const response = await instance.get(NOTICE_ENDPOINT.DOWNLOAD(noticeId), {
    responseType: 'blob',
  });

  const dispo = response.headers['content-disposition'] || '';
  const match = dispo.match(/filename\*?=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
  const filename = decodeURIComponent(match?.[1] || match?.[2] || 'download.bin');

  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  console.log('📢 공지사항 첨부파일 다운로드 완료:', filename);
  return response.data;
};
