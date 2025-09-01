import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import dayjs from 'dayjs';
import { returnAPI } from '../api';
import type {
  ReturnCreateRequest,
  ReturnListBranchParams,
  ReturnListHqParams,
  ReturnUpdateRequest,
} from '../types';

export const RETURN_QUERY_KEYS = {
  all: ['returns'] as const,
  lists: () => [...RETURN_QUERY_KEYS.all, 'list'] as const,
  listBranch: (params: ReturnListBranchParams) =>
    [...RETURN_QUERY_KEYS.lists(), 'branch', params] as const,
  listHq: (params?: ReturnListHqParams) => [...RETURN_QUERY_KEYS.lists(), 'hq', params] as const,
  details: () => [...RETURN_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...RETURN_QUERY_KEYS.details(), id] as const,
} as const;

// 가맹점 반품 목록 조회
export const useReturnsBranch = (params: ReturnListBranchParams) => {
  return useQuery({
    queryKey: RETURN_QUERY_KEYS.listBranch(params),
    queryFn: () => returnAPI.getReturnsBranch(params),
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 본사 반품 목록 조회
export const useReturnsHq = (params?: ReturnListHqParams) => {
  return useQuery({
    queryKey: RETURN_QUERY_KEYS.listHq(params),
    queryFn: () => returnAPI.getReturnsHq(params),
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 본사 반품 통계 조회
export const useReturnsStatistics = () => {
  const now = dayjs();
  const startOfMonth = now.startOf('month').startOf('day');
  const endOfMonth = now.endOf('month').endOf('day');

  return useQuery({
    queryKey: [
      ...RETURN_QUERY_KEYS.lists(),
      'statistics',
      startOfMonth.format('YYYY-MM'),
      endOfMonth.format('YYYY-MM'),
    ],
    queryFn: async () => {
      const res = await returnAPI.getReturnsHq({
        start: startOfMonth.format('YYYY-MM-DDTHH:mm:ss'),
        end: endOfMonth.format('YYYY-MM-DDTHH:mm:ss'),
        page: 0,
        size: 9999,
      });
      return res;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
    select: (data) => {
      const returns = data?.data || [];
      const totalReturns = returns.length;
      const calculatedStatistics = returns.reduce(
        (acc: any, ret: any) => {
          if (ret.status === 'RECEIVED') {
            acc.totalReceived += 1;
          }
          if (ret.status !== 'CANCELED') {
            acc.totalAmount += ret.totalPrice || 0;
          }
          return acc;
        },
        { totalReturns: 0, totalReceived: 0, totalAmount: 0 },
      );
      return { ...calculatedStatistics, totalReturns };
    },
  });
};

// 반품 상세 조회
export const useReturn = (returnId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: RETURN_QUERY_KEYS.detail(returnId),
    queryFn: () => returnAPI.getReturn(returnId),
    enabled: enabled && !!returnId,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 반품 생성
export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (data: ReturnCreateRequest) => returnAPI.createReturn(data),
    onSuccess: () => {
      messageApi.success('반품 요청이 완료되었습니다.');
      // 반품 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: RETURN_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      console.error('반품 요청 실패:', error);
      messageApi.error(error.response?.data?.message || '반품 요청 중 오류가 발생했습니다.');
    },
  });
};

// 반품 상태 업데이트
export const useUpdateReturn = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: ({ returnId, data }: { returnId: number; data: ReturnUpdateRequest }) =>
      returnAPI.updateReturn(returnId, data),
    onSuccess: (_, { returnId }) => {
      messageApi.success('반품 상태가 업데이트되었습니다.');
      // 반품 목록과 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: RETURN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: RETURN_QUERY_KEYS.detail(returnId) });
    },
    onError: (error: any) => {
      console.error('반품 상태 업데이트 실패:', error);
      messageApi.error(
        error.response?.data?.message || '반품 상태 업데이트 중 오류가 발생했습니다.',
      );
    },
  });
};

// 반품 삭제
export const useDeleteReturn = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (returnId: number) => returnAPI.deleteReturn(returnId),
    onSuccess: () => {
      messageApi.success('반품이 삭제되었습니다.');
      // 반품 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: RETURN_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      console.error('반품 삭제 실패:', error);
      messageApi.error(error.response?.data?.message || '반품 삭제 중 오류가 발생했습니다.');
    },
  });
};
