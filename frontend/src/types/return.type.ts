import type { ApiResponse, PaginatedResponse } from './api.type';

export interface Return {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  orderId: number;
  createdAt: string;
  updatedAt?: string;
  totalPrice: number;
  status: ReturnStatus;
  reason: string;
  items: ReturnItem[];
}

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;
export type ReturnStatus = keyof typeof RETURN_STATUS;
export type ReturnStatusColorMap = { [key in ReturnStatus]: string };
export type ReturnStatusTextMap = { [key in ReturnStatus]: string };

export interface ReturnItem {
  productId: number;
  productName: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface ReturnCartItem extends ReturnItemRequest {
  productName: string;
  manufacturer: string;
  subtotalPrice: number;
  productImgUrl?: string;
}

export interface ReturnCreateRequest {
  pharmacyId: number;
  orderId: number;
  reason: string;
  items: ReturnItemRequest[];
}

export interface ReturnListBranchParams {
  pharmacyId: number;
  page?: number;
  size?: number;
  status?: ReturnStatus;
}

export interface ReturnListAdminParams {
  pharmacyName?: string;
  page?: number;
  size?: number;
  status?: ReturnStatus;
}

export interface ReturnStatusUpdateRequest {
  status: ReturnStatus;
}

export type ReturnCreateResponse = ApiResponse<Return>;
export type ReturnListResponse = PaginatedResponse<Return>;
export type ReturnDetailResponse = ApiResponse<Return>;
export type ReturnApproveResponse = ApiResponse<string>;
export type ReturnRejectResponse = ApiResponse<string>;
export type ReturnStatusUpdateResponse = ApiResponse<string>;
export type ReturnDeleteResponse = ApiResponse<string>;
