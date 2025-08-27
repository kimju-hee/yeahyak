import type { Region } from '.';
import type { ApiResponse, PaginatedResponse } from './api.type';

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

export interface ReturnCreateReq {
  pharmacyId: number;
  orderId: number;
  reason: string;
  items: ReturnCreateReqItem[];
}

export interface ReturnCreateReqItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnCreateRes {
  returnId: number;
}

export interface ReturnUpdateReq {
  status: ReturnStatus;
}

export interface ReturnDetailRes {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: ReturnStatus;
  summary: string;
  reason: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  items: ReturnDetailResItem[];
}

export interface ReturnDetailResItem {
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

export interface ReturnListRes {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: ReturnStatus;
  summary: string;
  reason: string;
  totalPrice: number;
  createdAt: string;
}

export interface ReturnListBranchParams {
  pharmacyId: number;
  status?: ReturnStatus;
  page?: number;
  size?: number;
}

export interface ReturnListHqParams {
  status?: ReturnStatus;
  region?: Region;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

export type ReturnCreateResponse = ApiResponse<ReturnCreateRes>;
export type ReturnListResponse = PaginatedResponse<ReturnListRes>;
export type ReturnDetailResponse = ApiResponse<ReturnDetailRes>;
