import { PHARMACY_ENDPOINT } from '../constants';
import type {
  BalanceTxParams,
  BalanceTxResponse,
  PharmacyListParams,
  PharmacyListResponse,
  SettlementResponse,
} from '../types';
import { instance } from './client';

// 약국 목록 조회
export const getPharmacies = async (params?: PharmacyListParams): Promise<PharmacyListResponse> => {
  const response = await instance.get(PHARMACY_ENDPOINT.LIST, { params });

  console.log('💊 약국 목록 조회 응답:', response);
  return response.data;
};

// 정산 처리
export const settlement = async (pharmacyId: number): Promise<SettlementResponse> => {
  const response = await instance.post(PHARMACY_ENDPOINT.SETTLEMENT(pharmacyId));

  console.log('💰 정산 처리 응답:', response);
  return response.data;
};

// 약국 거래 내역 조회
export const getBalanceTxs = async (
  pharmacyId: number,
  params?: BalanceTxParams,
): Promise<BalanceTxResponse> => {
  const response = await instance.get(PHARMACY_ENDPOINT.BALANCE(pharmacyId), { params });

  console.log('💳 약국 거래 내역 조회 응답:', response);
  return response.data;
};
