import type { Region } from '.';
import type { ApiResponse, PaginatedResponse } from './api.type';

export const ORDER_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PREPARING: 'PREPARING',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;
export type OrderStatusColorMap = { [key in OrderStatus]: string };
export type OrderStatusTextMap = { [key in OrderStatus]: string };

export interface OrderCartItem {
  productId: number;
  productName: string;
  manufacturer: string;
  productImgUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderCreateReq {
  pharmacyId: number;
  items: OrderCreateItemReq[];
}

export interface OrderCreateItemReq {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderCreateRes {
  orderId: number;
}

export interface OrderUpdateReq {
  status: OrderStatus;
}

export interface OrderDetailRes {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: OrderStatus;
  summary: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderDetailResItem[];
}

export interface OrderDetailResItem {
  productId: number;
  productName: string;
  mainCategory: string;
  subCategory: string;
  manufacturer: string;
  productImgUrl: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderListRes {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: OrderStatus;
  summary: string;
  totalPrice: number;
  createdAt: string;
}

export interface OrderListBranchParams {
  pharmacyId: number;
  status?: OrderStatus;
  page?: number;
  size?: number;
}

export interface OrderListHqParams {
  status?: OrderStatus;
  region?: Region;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

export interface OrderForecastReq {
  file: File;
}

export type OrderCreateResponse = ApiResponse<OrderCreateRes>;
export type OrderListResponse = PaginatedResponse<OrderDetailRes>;
export type OrderDetailResponse = ApiResponse<OrderDetailRes>;
