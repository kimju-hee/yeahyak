import { ORDER_ENDPOINT } from '../constants';
import type {
  OrderApproveResponse,
  OrderCreateRequest,
  OrderCreateResponse,
  OrderDeleteResponse,
  OrderDetailResponse,
  OrderForecastRequest,
  OrderListAdminParams,
  OrderListBranchParams,
  OrderListResponse,
  OrderRejectResponse,
  OrderStatusUpdateRequest,
  OrderStatusUpdateResponse,
} from '../types';
import { instance } from './client';

// 발주 생성
export const createOrder = async (data: OrderCreateRequest): Promise<OrderCreateResponse> => {
  const response = await instance.post(ORDER_ENDPOINT.CREATE, data);
  console.log('🛒 발주 생성 응답:', response);
  return response.data;
};

// 가맹점에서 발주 목록 조회
export const getBranchOrders = async (
  params: OrderListBranchParams,
): Promise<OrderListResponse> => {
  const response = await instance.get(ORDER_ENDPOINT.LIST_BRANCH, { params });
  console.log('🛒 가맹점 발주 목록 조회 응답:', response);
  return response.data;
};

// 본사에서 발주 목록 조회
export const getAdminOrders = async (params?: OrderListAdminParams): Promise<OrderListResponse> => {
  const response = await instance.get(ORDER_ENDPOINT.LIST_ADMIN, { params });
  console.log('🛒 본사 발주 목록 조회 응답:', response);
  return response.data;
};

// 발주 상세 조회
export const getOrder = async (orderId: number): Promise<OrderDetailResponse> => {
  const response = await instance.get(ORDER_ENDPOINT.DETAIL(orderId));
  console.log('🛒 발주 상세 조회 응답:', response);
  return response.data;
};

// 발주 승인
export const approveOrder = async (orderId: number): Promise<OrderApproveResponse> => {
  const response = await instance.post(ORDER_ENDPOINT.APPROVE(orderId));
  console.log('🛒 발주 승인 응답:', response);
  return response.data;
};

// 발주 거절
export const rejectOrder = async (orderId: number): Promise<OrderRejectResponse> => {
  const response = await instance.post(ORDER_ENDPOINT.REJECT(orderId));
  console.log('🛒 발주 거절 응답:', response);
  return response.data;
};

// 발주 상태 업데이트
export const updateOrderStatus = async (
  orderId: number,
  data: OrderStatusUpdateRequest,
): Promise<OrderStatusUpdateResponse> => {
  const response = await instance.patch(ORDER_ENDPOINT.UPDATE_STATUS(orderId), data);
  console.log('🛒 발주 상태 업데이트 응답:', response);
  return response.data;
};

// 발주 삭제
export const deleteOrder = async (orderId: number): Promise<OrderDeleteResponse> => {
  const response = await instance.delete(ORDER_ENDPOINT.DELETE(orderId));
  console.log('🛒 발주 삭제 응답:', response);
  return response.data;
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
