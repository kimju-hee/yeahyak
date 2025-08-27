import type { ApiResponse, PaginatedResponse } from './api.type';

export interface PharmacyListParams {
  unsettled?: boolean;
  region?: Region;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface PharmacyListRes {
  pharmacyId: number;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  region: Region;
  contact: string;
  outstandingBalance: number;
  latestSettlementAt: string;
}

export const REGION = {
  서울: '서울',
  인천: '인천',
  경기: '경기',
  강원특별자치도: '강원특별자치도',
  충북: '충북',
  세종특별자치시: '세종특별자치시',
  충남: '충남',
  대전: '대전',
  경북: '경북',
  대구: '대구',
  울산: '울산',
  부산: '부산',
  경남: '경남',
  전북특별자치도: '전북특별자치도',
  전남: '전남',
  광주: '광주',
  제주특별자치도: '제주특별자치도',
} as const;
export type Region = keyof typeof REGION;
export type RegionTextMap = { [key in Region]: string };

export interface SettlementRes {
  balanceTxId: number;
  pharmacyId: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface BalanceTxListParams {
  pharmacyId: number;
  type?: BalanceTxType;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

export interface BalanceTxListRes {
  balanceTxId: number;
  pharmacyId: number;
  type: BalanceTxType;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export const BALANCE_TX_TYPE = {
  ORDER: 'ORDER',
  RETURN: 'RETURN',
  ORDER_CANCEL: 'ORDER_CANCEL',
  SETTLEMENT: 'SETTLEMENT',
} as const;
export type BalanceTxType = keyof typeof BALANCE_TX_TYPE;
export type BalanceTxTypeTextMap = { [key in BalanceTxType]: string };
export type BalanceTxTypeColorMap = { [key in BalanceTxType]: string };

export type PharmacyListResponse = PaginatedResponse<PharmacyListRes>;
export type SettlementResponse = ApiResponse<SettlementRes>;
export type BalanceTxListResponse = PaginatedResponse<BalanceTxListRes>;
