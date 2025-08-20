import type { ApiResponse, PaginatedResponse } from './api.type';

export interface Order {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[] | OrderDetailItem[];
}

export const ORDER_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;
export type OrderStatusColorMap = { [key in OrderStatus]: string };
export type OrderStatusTextMap = { [key in OrderStatus]: string };

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderDetailItem extends OrderItem {
  productId: number;
  manufacturer: string;
  mainCategory: string;
  subCategory: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderCartItem extends OrderItemRequest {
  productName: string;
  manufacturer: string;
  productImgUrl?: string;
}

export interface OrderCreateRequest {
  pharmacyId: number;
  items: OrderItemRequest[];
}

export interface OrderListBranchParams {
  pharmacyId: number;
  page?: number;
  size?: number;
  status?: OrderStatus;
}

export interface OrderListAdminParams {
  pharmacyName?: string;
  page?: number;
  size?: number;
  status?: OrderStatus;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

export interface OrderForecastRequest {
  file: File;
}
export type OrderCreateResponse = ApiResponse<Order>;
export type OrderListResponse = PaginatedResponse<Order>;
export type OrderDetailResponse = ApiResponse<Order>;
export type OrderApproveResponse = ApiResponse<string>;
export type OrderRejectResponse = ApiResponse<string>;
export type OrderStatusUpdateResponse = ApiResponse<string>;
export type OrderDeleteResponse = ApiResponse<string>;
