import { ORDER_ENDPOINT } from '../constants';
import type {
  OrderCreateRequest,
  OrderCreateResponse,
  OrderDetailResponse,
  OrderForecastRequest,
  OrderListBranchParams,
  OrderListHqParams,
  OrderListResponse,
  OrderUpdateRequest,
} from '../types';
import { instance } from './client';

// 발주 생성
export const createOrder = async (data: OrderCreateRequest): Promise<OrderCreateResponse> => {
  const response = await instance.post(ORDER_ENDPOINT.CREATE, data);
  console.log('🛒 발주 생성 응답:', response);
  return response.data;
};

// 본사에서 발주 목록 조회
export const getOrdersHq = async (params?: OrderListHqParams): Promise<OrderListResponse> => {
  const response = await instance.get(ORDER_ENDPOINT.LIST_HQ, { params });
  console.log('🛒 본사 발주 목록 조회 응답:', response);
  return response.data;
};

// 가맹점에서 발주 목록 조회
export const getOrdersBranch = async (
  params: OrderListBranchParams,
): Promise<OrderListResponse> => {
  const response = await instance.get(ORDER_ENDPOINT.LIST_BRANCH, { params });
  console.log('🛒 가맹점 발주 목록 조회 응답:', response);
  return response.data;
};

// 발주 상세 조회
export const getOrder = async (orderId: number): Promise<OrderDetailResponse> => {
  const response = await instance.get(ORDER_ENDPOINT.DETAIL(orderId));
  console.log('🛒 발주 상세 조회 응답:', response);
  return response.data;
};

// 발주 상태 업데이트
export const updateOrder = async (orderId: number, data: OrderUpdateRequest): Promise<void> => {
  const response = await instance.patch(ORDER_ENDPOINT.UPDATE(orderId), data);
  console.log('🛒 발주 상태 업데이트 응답:', response);
};

// 발주 삭제
export const deleteOrder = async (orderId: number): Promise<void> => {
  const response = await instance.delete(ORDER_ENDPOINT.DELETE(orderId));
  console.log('🛒 발주 삭제 응답:', response);
};

// 발주 예측
export const forecastOrder = async (data: OrderForecastRequest) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await instance.post(ORDER_ENDPOINT.FORECAST, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('🛒 발주 예측 응답:', response);
  return response.data;
};
