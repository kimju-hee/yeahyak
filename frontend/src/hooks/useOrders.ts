import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { orderAPI } from '../api';
import type {
  OrderCreateRequest,
  OrderListBranchParams,
  OrderListHqParams,
  OrderUpdateRequest,
} from '../types';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  listBranch: (params: OrderListBranchParams) =>
    [...ORDER_QUERY_KEYS.lists(), 'branch', params] as const,
  listHq: (params?: OrderListHqParams) => [...ORDER_QUERY_KEYS.lists(), 'hq', params] as const,
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...ORDER_QUERY_KEYS.details(), id] as const,
  forecast: () => [...ORDER_QUERY_KEYS.all, 'forecast'] as const,
} as const;

// 가맹점 발주 목록 조회
export const useOrdersBranch = (params: OrderListBranchParams) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.listBranch(params),
    queryFn: () => orderAPI.getOrdersBranch(params),
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 본사 발주 목록 조회
export const useOrdersHq = (params?: OrderListHqParams) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.listHq(params),
    queryFn: () => orderAPI.getOrdersHq(params),
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 발주 상세 조회
export const useOrder = (orderId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: () => orderAPI.getOrder(orderId),
    enabled: enabled && !!orderId,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 발주 생성
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (data: OrderCreateRequest) => orderAPI.createOrder(data),
    onSuccess: () => {
      messageApi.success('발주 요청이 완료되었습니다.');
      // 발주 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      console.error('발주 요청 실패:', error);
      messageApi.error(error.response?.data?.message || '발주 요청 중 오류가 발생했습니다.');
    },
  });
};

// 발주 상태 업데이트
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: OrderUpdateRequest }) =>
      orderAPI.updateOrder(orderId, data),
    onSuccess: (_, { orderId }) => {
      messageApi.success('발주 상태가 업데이트되었습니다.');
      // 발주 목록과 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.detail(orderId) });
    },
    onError: (error: any) => {
      console.error('발주 상태 업데이트 실패:', error);
      messageApi.error(
        error.response?.data?.message || '발주 상태 업데이트 중 오류가 발생했습니다.',
      );
    },
  });
};

// 발주 삭제
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (orderId: number) => orderAPI.deleteOrder(orderId),
    onSuccess: () => {
      messageApi.success('발주가 삭제되었습니다.');
      // 발주 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      console.error('발주 삭제 실패:', error);
      messageApi.error(error.response?.data?.message || '발주 삭제 중 오류가 발생했습니다.');
    },
  });
};

// AI 발주 예측
export const useOrderForecast = () => {
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (file: File) => orderAPI.forecastOrder({ file }),
    onSuccess: () => {
      messageApi.success('AI 발주 추천이 완료되었습니다!');
    },
    onError: (error: any) => {
      console.error('AI 발주 추천 실패:', error);
      messageApi.error(error.response?.data?.message || 'AI 발주 추천 중 오류가 발생했습니다.');
    },
  });
};
