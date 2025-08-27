import type { ApiResponse, MainCategory, PaginatedResponse, Region, SubCategory } from '.';

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  RECEIVED: 'RECEIVED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;
export type ReturnStatus = keyof typeof RETURN_STATUS;
export type ReturnStatusColorMap = { [key in ReturnStatus]: string };
export type ReturnStatusTextMap = { [key in ReturnStatus]: string };

export interface ReturnCartItem {
  productId: number;
  productName: string;
  manufacturer: string;
  productImgUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnCreateRequest {
  pharmacyId: number;
  orderId: number;
  reason: string;
  items: ReturnCreateRequestItem[];
}

export interface ReturnCreateRequestItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnCreate {
  returnId: number;
}

export interface ReturnUpdateRequest {
  status: ReturnStatus;
}

export interface ReturnDetail {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: ReturnStatus;
  summary: string;
  reason: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  items: ReturnDetailItem[];
}

export interface ReturnDetailItem {
  productId: number;
  productName: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  manufacturer: string;
  productImgUrl: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnList {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: ReturnStatus;
  summary: string;
  reason: string;
  totalPrice: number;
  createdAt: string;
}

export interface ReturnListHqParams {
  status?: ReturnStatus;
  region?: Region;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

export interface ReturnListBranchParams {
  pharmacyId: number;
  status?: ReturnStatus;
  page?: number;
  size?: number;
}

export type ReturnCreateResponse = ApiResponse<ReturnCreate>;
export type ReturnListResponse = PaginatedResponse<ReturnList>;
export type ReturnDetailResponse = ApiResponse<ReturnDetail>;
