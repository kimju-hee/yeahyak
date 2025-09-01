import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { pharmacyAPI } from '../api';
import type { BalanceTxParams, PharmacyListParams } from '../types';

export const PHARMACY_QUERY_KEYS = {
  all: ['pharmacies'] as const,
  lists: () => [...PHARMACY_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PharmacyListParams) => [...PHARMACY_QUERY_KEYS.lists(), params] as const,
  balances: () => [...PHARMACY_QUERY_KEYS.all, 'balance'] as const,
  balance: (id: number, params?: BalanceTxParams) =>
    [...PHARMACY_QUERY_KEYS.balances(), id, params] as const,
} as const;

// 약국 목록 조회
export const usePharmacies = (params?: PharmacyListParams) => {
  return useQuery({
    queryKey: PHARMACY_QUERY_KEYS.list(params),
    queryFn: () => pharmacyAPI.getPharmacies(params),
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    refetchOnWindowFocus: false,
  });
};

// 약국 거래내역 조회
export const useBalanceTxs = (
  pharmacyId: number,
  params?: BalanceTxParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: PHARMACY_QUERY_KEYS.balance(pharmacyId, params),
    queryFn: () => pharmacyAPI.getBalanceTxs(pharmacyId, params),
    enabled: enabled && !!pharmacyId,
    staleTime: 1000 * 60 * 2, // 2분 캐싱(거래 내역은 더 자주 업데이트)
    refetchOnWindowFocus: false,
  });
};

// 정산 처리
export const useSettlement = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: (pharmacyId: number) => pharmacyAPI.settlement(pharmacyId),
    onSuccess: (response) => {
      if (response.success) {
        messageApi.success('정산 처리가 완료되었습니다.');
        // 약국 목록 캐시 무효화
        queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.lists() });
        // 해당 약국 거래내역 캐시 무효화
        queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.balances() });
      }
    },
    onError: (error: any) => {
      console.error('정산 처리 실패:', error);
      messageApi.error(error.response?.data?.message || '정산 처리 중 오류가 발생했습니다.');
    },
  });
};
