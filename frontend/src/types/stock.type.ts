import type { ApiResponse, PaginatedResponse } from './api.type';

export interface StockInReq {
  productId: number;
  amount: number;
}

export interface StockInRes {
  stockTxId: number;
  productId: number;
  amount: number;
  quantityBefore: number;
  quantityAfter: number;
  createdAt: string;
}

export interface StockTxDetailParams {
  stockTxId: number;
  page?: number;
  size?: number;
}

export interface StockTxDetailRes {
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

export type StockInResponse = ApiResponse<StockInRes>;
export type StockTxDetailResponse = PaginatedResponse<StockTxDetailRes>;
