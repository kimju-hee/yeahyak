import type { BalanceTxType, Region } from '.';
import type { ApiResponse, PaginatedResponse } from './api.type';

export interface PharmacyListParams {
  unsettled?: boolean;
  region?: Region;
  keyword?: string; // 약국명
  page?: number;
  size?: number;
}

export interface PharmacyList {
  pharmacyId: number;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  region: Region;
  contact: string;
  balance: number;
  latestSettlementAt: string;
}

export interface Settlement {
  balanceTxId: number;
  pharmacyId: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface BalanceTxParams {
  pharmacyId: number;
  type?: BalanceTxType;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

export interface BalanceTx {
  balanceTxId: number;
  pharmacyId: number;
  type: BalanceTxType;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export type PharmacyListResponse = PaginatedResponse<PharmacyList>;
export type SettlementResponse = ApiResponse<Settlement>;
export type BalanceTxResponse = PaginatedResponse<BalanceTx>;
