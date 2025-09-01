import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { aiAPI, productAPI } from '../api';
import type {
  InventoryInRequest,
  InventoryTxParams,
  ProductCreateRequest,
  ProductListParams,
  ProductUpdateRequest,
} from '../types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  inventories: () => [...productKeys.all, 'inventory'] as const,
  inventory: (id: number, params?: InventoryTxParams) =>
    [...productKeys.inventories(), id, params] as const,
};

// 제품 목록 조회
export const useProducts = (params: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await productAPI.getProducts(params);
      if (response.success) {
        return response;
      }
      throw new Error('제품 목록을 불러올 수 없습니다.');
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: true, // 브라우저 탭 클릭 시 자동 업데이트
    refetchOnMount: true, // 컴포넌트 마운트 시 항상 최신 데이터 확인
  });
};

// 제품 상세 조회
export const useProduct = (productId: number) => {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      const response = await productAPI.getProduct(productId);
      if (response.success) {
        return response.data;
      }
      throw new Error('제품 정보를 불러올 수 없습니다.');
    },
    enabled: !!productId && !isNaN(productId),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: true, // 브라우저 탭 클릭 시 자동 업데이트
  });
};

// 제품 생성
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateRequest) => productAPI.createProduct(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      }
    },
    onError: (error: any) => {
      console.error('제품 등록 실패:', error);
    },
  });
};

// 제품 수정
export const useUpdateProduct = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductUpdateRequest) => productAPI.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      console.error('제품 수정 실패:', error);
    },
  });
};

// 제품 삭제
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => productAPI.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      console.error('제품 삭제 실패:', error);
    },
  });
};

// AI 제품 요약 (신제품 요약 재사용)
export const useAiProductSummarize = () => {
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      return await aiAPI.summarizeNewProduct({ file });
    },
    onError: (error: any) => {
      console.error('AI 제품 요약 실패:', error);
    },
  });
};

// 재고 거래내역 조회
export const useInventoryTxList = (
  productId: number,
  params?: InventoryTxParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: productKeys.inventory(productId, params),
    queryFn: async () => {
      const response = await productAPI.getInventoryTxList(productId, params);
      if (response.success) {
        return response.data;
      }
      throw new Error('재고 거래내역을 불러올 수 없습니다.');
    },
    enabled: enabled && !!productId,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지 (재고는 더 자주 업데이트)
    refetchOnWindowFocus: true,
  });
};

// 재고 입고 처리
export const useInventoryIn = () => {
  const queryClient = useQueryClient();
  const [messageApi] = message.useMessage();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: InventoryInRequest }) =>
      productAPI.inventoryIn(productId, data),
    onSuccess: (response, { productId }) => {
      if (response.success) {
        messageApi.success('재고 입고 처리가 완료되었습니다.');
        // 제품 목록과 상세 정보 캐시 무효화
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
        // 재고 거래내역 캐시 무효화
        queryClient.invalidateQueries({ queryKey: productKeys.inventories() });
      }
    },
    onError: (error: any) => {
      console.error('재고 입고 처리 실패:', error);
      messageApi.error(error.response?.data?.message || '재고 입고 처리 중 오류가 발생했습니다.');
    },
  });
};
