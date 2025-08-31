import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { pharmacyRequestAPI } from '../api';
import type { PharmacyRequestListParams } from '../types';

export const PHARMACY_REQUEST_QUERY_KEYS = {
  all: ['pharmacyRequests'] as const,
  lists: () => [...PHARMACY_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PharmacyRequestListParams) =>
    [...PHARMACY_REQUEST_QUERY_KEYS.lists(), params] as const,
  details: () => [...PHARMACY_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PHARMACY_REQUEST_QUERY_KEYS.details(), id] as const,
} as const;

// 약국 등록 요청 목록 조회
export const usePharmacyRequests = (params?: PharmacyRequestListParams) => {
  return useQuery({
    queryKey: PHARMACY_REQUEST_QUERY_KEYS.list(params),
    queryFn: () => pharmacyRequestAPI.getPharmacyRequests(params),
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 약국 등록 요청 상세 조회
export const usePharmacyRequest = (pharmacyRequestId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: PHARMACY_REQUEST_QUERY_KEYS.detail(pharmacyRequestId),
    queryFn: () => pharmacyRequestAPI.getPharmacyRequest(pharmacyRequestId),
    enabled: enabled && !!pharmacyRequestId,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 약국 등록 요청 승인
export const useApprovePharmacyRequest = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (pharmacyRequestId: number) => pharmacyRequestAPI.approve(pharmacyRequestId),
    onSuccess: () => {
      messageApi.success('요청이 승인 처리되었습니다.');
      // 약국 요청 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: PHARMACY_REQUEST_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      console.error('요청 승인 처리 실패:', error);
      messageApi.error(error.response?.data?.message || '요청 승인 처리 중 오류가 발생했습니다.');
    },
  });
};

// 약국 등록 요청 거절
export const useRejectPharmacyRequest = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (pharmacyRequestId: number) => pharmacyRequestAPI.reject(pharmacyRequestId),
    onSuccess: () => {
      messageApi.success('요청이 거절 처리되었습니다.');
      // 약국 요청 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: PHARMACY_REQUEST_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      console.error('요청 거절 처리 실패:', error);
      messageApi.error(error.response?.data?.message || '요청 거절 처리 중 오류가 발생했습니다.');
    },
  });
};
