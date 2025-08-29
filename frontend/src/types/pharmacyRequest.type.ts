import type { PharmacyRequestStatus, Region } from '.';
import type { ApiResponse, PaginatedResponse } from './api.type';

export interface PharmacyRequestListParams {
  status?: PharmacyRequestStatus;
  region?: Region;
  keyword?: string; // 약국명
  page?: number;
  size?: number;
}

export interface PharmacyRequestList {
  pharmacyRequestId: number;
  userId: number;
  email: string;
  pharmacyName: string;
  bizRegNo: string;
  region: Region;
  contact: string;
  status: PharmacyRequestStatus;
  createdAt: string;
}

export interface PharmacyRequestDetail {
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
  createdAt: string;
  updatedAt?: string;
}

export type PharmacyRequestListResponse = PaginatedResponse<PharmacyRequestList>;
export type PharmacyRequestDetailResponse = ApiResponse<PharmacyRequestDetail>;
