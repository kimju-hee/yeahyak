import type { ApiResponse, PaginatedResponse } from './api.type';

export interface StockInRequest {
  productId: number;
  amount: number;
}

export interface StockIn {
  stockTxId: number;
  productId: number;
  amount: number;
  quantityBefore: number;
  quantityAfter: number;
  createdAt: string;
}

export interface StockTxDetailParams {
  productId: number;
  page?: number;
  size?: number;
}

export interface StockTxDetail {
  stockTxId: number;
  productId: number;
  type: StockTxType;
  amount: number;
  quantityAfter: number;
  createdAt: string;
}

export const STOCK_TX_TYPE = {
  ORDER: 'ORDER',
  IN: 'IN',
  ORDER_CANCEL: 'ORDER_CANCEL',
  RETURN: 'RETURN',
} as const;
export type StockTxType = keyof typeof STOCK_TX_TYPE;
export type StockTxTypeTextMap = { [key in StockTxType]: string };

export type StockInResponse = ApiResponse<StockIn>;
export type StockTxDetailResponse = PaginatedResponse<StockTxDetail>;
