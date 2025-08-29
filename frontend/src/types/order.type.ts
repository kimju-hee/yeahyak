import type {
  ApiResponse,
  MainCategory,
  OrderStatus,
  PaginatedResponse,
  Region,
  SubCategory,
} from '.';

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

// CHECK: 파라미터 확인
export interface OrderListHqParams {
  status?: OrderStatus;
  region?: Region;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

// CHECK: 파라미터 확인
export interface OrderListBranchParams {
  pharmacyId: number;
  status?: OrderStatus;
  page?: number;
  size?: number;
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
  productImgUrl?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderUpdateRequest {
  status: OrderStatus;
}

export interface OrderForecastRequest {
  file: File;
}

export interface OrderForecast {
  productId: number;
  productName: string;
  insuranceCode: string;
  manufacturer: string;
  productImgUrl: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export type OrderCreateResponse = ApiResponse<OrderCreate>;
export type OrderListResponse = PaginatedResponse<OrderList>;
export type OrderDetailResponse = ApiResponse<OrderDetail>;
export type OrderForecastResponse = ApiResponse<OrderForecast[]>;
