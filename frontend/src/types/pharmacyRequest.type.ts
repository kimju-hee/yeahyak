import type { Region } from '.';
import type { ApiResponse, PaginatedResponse } from './api.type';

export interface PharmacyRequestListParams {
  status?: PharmacyRequestStatus;
  region?: Region;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface PharmacyRequestListRes {
  pharmacyRequestId: number;
  userId: number;
  email: string;
  pharmacyName: string;
  bizRegNo: string;
  region: Region;
  contact: string;
  status: PharmacyRequestStatus;
  requestedAt: string;
}

export const PHARMACY_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type PharmacyRequestStatus = keyof typeof PHARMACY_REQUEST_STATUS;
export type PharmacyRequestStatusColorMap = { [key in PharmacyRequestStatus]: string };
export type PharmacyRequestStatusTextMap = { [key in PharmacyRequestStatus]: string };

export interface PharmacyRequestDetailRes {
  pharmacyRequestId: number;
  userId: number;
  email: string;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  region: Region;
  contact: string;
  status: PharmacyRequestStatus;
  requestedAt: string;
  processedAt: string;
}

export type PharmacyRequestListResponse = PaginatedResponse<PharmacyRequestListRes>;
export type PharmacyRequestDetailResponse = ApiResponse<PharmacyRequestDetailRes>;
