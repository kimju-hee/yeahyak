import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiAPI, noticeAPI } from '../api';
import type {
  NoticeCreateRequestWithFile,
  NoticeListParams,
  NoticeType,
  NoticeUpdateRequestWithFile,
} from '../types';

export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (params: NoticeListParams) => [...noticeKeys.lists(), params] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (id: number) => [...noticeKeys.details(), id] as const,
  latest: () => [...noticeKeys.all, 'latest'] as const,
};

// 공지사항 목록 조회
export const useNotices = (params: NoticeListParams) => {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: async () => {
      const response = await noticeAPI.getNotices(params);
      if (response.success) {
        return response;
      }
      throw new Error('공지사항 목록을 불러올 수 없습니다.');
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: true, // 브라우저 탭 클릭 시 자동 업데이트
    refetchOnMount: true, // 컴포넌트 마운트 시 항상 최신 데이터 확인
  });
};

// 최근 공지사항 목록 조회
export const useLatestNotices = () => {
  return useQuery({
    queryKey: noticeKeys.latest(),
    queryFn: async () => {
      const response = await noticeAPI.getLatestNotices();
      if (response.success) {
        return response.data;
      }
      throw new Error('최근 공지사항을 불러올 수 없습니다.');
    },
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: true, // 브라우저 탭 클릭 시 자동 업데이트
  });
};

// 공지사항 상세 조회
export const useNotice = (noticeId: number) => {
  return useQuery({
    queryKey: noticeKeys.detail(noticeId),
    queryFn: async () => {
      const response = await noticeAPI.getNotice(noticeId);
      if (response.success) {
        return response.data;
      }
      throw new Error('공지사항을 불러올 수 없습니다.');
    },
    enabled: !!noticeId && !isNaN(noticeId),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: true, // 브라우저 탭 클릭 시 자동 업데이트
  });
};

// 공지사항 생성
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NoticeCreateRequestWithFile) => noticeAPI.createNotice(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: noticeKeys.latest() });
      }
    },
    onError: (error: any) => {
      console.error('공지사항 등록 실패:', error);
    },
  });
};

// 공지사항 수정
export const useUpdateNotice = (noticeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NoticeUpdateRequestWithFile) => noticeAPI.updateNotice(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(noticeId) });
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noticeKeys.latest() });
    },
    onError: (error: any) => {
      console.error('공지사항 수정 실패:', error);
    },
  });
};

// 공지사항 삭제
export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: number) => noticeAPI.deleteNotice(noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noticeKeys.latest() });
    },
    onError: (error: any) => {
      console.error('공지사항 삭제 실패:', error);
    },
  });
};

// AI 문서 요약
export const useAiSummarize = () => {
  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: NoticeType }) => {
      switch (type) {
        case 'LAW':
          return await aiAPI.summarizeLaw({ file });
        case 'EPIDEMIC':
          return await aiAPI.summarizeEpidemic({ file });
        case 'NEW_PRODUCT':
          return await aiAPI.summarizeNewProduct({ file });
        default:
          throw new Error('지원되지 않는 카테고리입니다.');
      }
    },
    onError: (error: any) => {
      console.error('AI 문서 요약 실패:', error);
    },
  });
};
