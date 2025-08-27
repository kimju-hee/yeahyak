import type { StockTxType, StockTxTypeTextMap } from '../types';

export const STOCK_ENDPOINT = {
  IN: '/stock-txs/in',
  DETAIL: '/stock-txs',
} as const;

export const STOCK_TX_TYPE_OPTIONS = [
  { value: 'ORDER' as StockTxType, label: '발주' },
  { value: 'IN' as StockTxType, label: '입고' },
  { value: 'ORDER_CANCEL' as StockTxType, label: '발주 취소' },
  { value: 'RETURN' as StockTxType, label: '반품' },
] as const;

export const STOCK_TX_TYPE_TEXT: StockTxTypeTextMap = {
  ORDER: '발주',
  IN: '입고',
  ORDER_CANCEL: '발주 취소',
  RETURN: '반품',
} as const;
