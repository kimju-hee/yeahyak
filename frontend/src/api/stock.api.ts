import { STOCK_ENDPOINT } from '../constants';
import type {
  StockInRequest,
  StockInResponse,
  StockTxDetailParams,
  StockTxDetailResponse,
} from '../types';
import { instance } from './client';

// 재고 입고 처리
export const stockIn = async (data: StockInRequest): Promise<StockInResponse> => {
  const response = await instance.post(STOCK_ENDPOINT.IN, data);
  console.log('🚚 재고 입고 처리 응답:', response);
  return response.data;
};

// 제품별 재고 거래 내역 조회
export const getStockTxList = async (
  params: StockTxDetailParams,
): Promise<StockTxDetailResponse> => {
  const response = await instance.get(STOCK_ENDPOINT.DETAIL, { params });
  console.log('🚚 재고 거래 내역 조회 응답:', response);
  return response.data;
};
