import { STOCK_ENDPOINT } from '../constants';
import type {
  StockInReq,
  StockInResponse,
  StockTxDetailParams,
  StockTxDetailResponse,
} from '../types';
import { instance } from './client';

// 재고 입고 처리
export const stockIn = async (data: StockInReq): Promise<StockInResponse> => {
  const response = await instance.post(STOCK_ENDPOINT.IN, data);
  console.log('🚚 재고 입고 처리 응답:', response);
  return response.data;
};

// 재고 상세 조회
export const getStockDetail = async (
  params?: StockTxDetailParams,
): Promise<StockTxDetailResponse> => {
  const response = await instance.get(STOCK_ENDPOINT.DETAIL, { params });
  console.log('🚚 재고 상세 조회 응답:', response);
  return response.data;
};
