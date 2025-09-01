import { PHARMACY_REQUEST_ENDPOINT } from '../constants';
import type {
  PharmacyRequestDetailResponse,
  PharmacyRequestListParams,
  PharmacyRequestListResponse,
} from '../types';
import { instance } from './client';

// 약국 등록 요청 목록 조회
export const getPharmacyRequests = async (
  params?: PharmacyRequestListParams,
): Promise<PharmacyRequestListResponse> => {
  const response = await instance.get(PHARMACY_REQUEST_ENDPOINT.LIST, { params });

  console.log('📋 약국 등록 요청 목록 조회 응답:', response);
  return response.data;
};

// 약국 등록 요청 상세 조회
export const getPharmacyRequest = async (
  pharmacyRequestId: number,
): Promise<PharmacyRequestDetailResponse> => {
  const response = await instance.get(PHARMACY_REQUEST_ENDPOINT.DETAIL(pharmacyRequestId));

  console.log('📋 약국 등록 요청 상세 조회 응답:', response);
  return response.data;
};

// 약국 등록 요청 승인
export const approve = async (pharmacyRequestId: number): Promise<void> => {
  const response = await instance.post(PHARMACY_REQUEST_ENDPOINT.APPROVE(pharmacyRequestId));

  console.log('✅ 약국 등록 요청 승인 응답:', response);
};

// 약국 등록 요청 거절
export const reject = async (pharmacyRequestId: number): Promise<void> => {
  const response = await instance.post(PHARMACY_REQUEST_ENDPOINT.REJECT(pharmacyRequestId));

  console.log('❌ 약국 등록 요청 거절 응답:', response);
};
