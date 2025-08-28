import type { ApiResponse, MainCategory, PaginatedResponse, Region, SubCategory } from '.';

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

export interface OrderCreateRequest {
  pharmacyId: number;
  items: OrderCreateRequestItem[];
}

export interface OrderCreateRequestItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderCreate {
  orderId: number;
}

export interface OrderUpdateRequest {
  status: OrderStatus;
}

export interface OrderDetail {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: OrderStatus;
  summary: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderDetailItem[];
}

export interface OrderDetailItem {
  productId: number;
  productName: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  manufacturer: string;
  productImgUrl: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderList {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: OrderStatus;
  summary: string;
  totalPrice: number;
  createdAt: string;
}

export interface OrderListHqParams {
  status?: OrderStatus;
  region?: Region;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

export interface OrderListBranchParams {
  pharmacyId: number;
  status?: OrderStatus;
  page?: number;
  size?: number;
}

export interface OrderForecastRequest {
  file: File;
}

export type OrderCreateResponse = ApiResponse<OrderCreate>;
export type OrderListResponse = PaginatedResponse<OrderList>;
export type OrderDetailResponse = ApiResponse<OrderDetail>;
