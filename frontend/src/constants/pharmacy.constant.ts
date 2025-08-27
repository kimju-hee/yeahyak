import type {
  BalanceTxType,
  BalanceTxTypeColorMap,
  BalanceTxTypeTextMap,
  Region,
  RegionTextMap,
} from '../types';

export const PHARMACY_ENDPOINT = {
  LIST: '/pharmacies',
  SETTLEMENT: (pharmacyId: number) => `/pharmacies/${pharmacyId}/settlement`,
  BALANCE_TXS: (pharmacyId: number) => `/pharmacies/${pharmacyId}/balance-txs`,
} as const;

export const BALANCE_TX_TYPE_OPTIONS = [
  { value: 'ORDER' as BalanceTxType, label: '발주' },
  { value: 'RETURN' as BalanceTxType, label: '반품' },
  { value: 'ORDER_CANCEL' as BalanceTxType, label: '발주 취소' },
  { value: 'SETTLEMENT' as BalanceTxType, label: '정산' },
] as const;

export const BALANCE_TX_TYPE_COLORS: BalanceTxTypeColorMap = {
  ORDER: 'magenta',
  RETURN: 'green',
  ORDER_CANCEL: 'gold',
  SETTLEMENT: 'blue',
} as const;

export const BALANCE_TX_TYPE_TEXT: BalanceTxTypeTextMap = {
  ORDER: '발주',
  RETURN: '반품',
  ORDER_CANCEL: '발주 취소',
  SETTLEMENT: '정산',
} as const;

export const REGION_OPTIONS = [
  { value: '서울' as Region, label: '서울' },
  { value: '경기' as Region, label: '경기' },
  { value: '인천' as Region, label: '인천' },
  { value: '강원특별자치도' as Region, label: '강원특별자치도' },
  { value: '충북' as Region, label: '충북' },
  { value: '세종특별자치시' as Region, label: '세종특별자치시' },
  { value: '충남' as Region, label: '충남' },
  { value: '대전' as Region, label: '대전' },
  { value: '경북' as Region, label: '경북' },
  { value: '대구' as Region, label: '대구' },
  { value: '울산' as Region, label: '울산' },
  { value: '부산' as Region, label: '부산' },
  { value: '경남' as Region, label: '경남' },
  { value: '전북특별자치도' as Region, label: '전북특별자치도' },
  { value: '전남' as Region, label: '전남' },
  { value: '광주' as Region, label: '광주' },
  { value: '제주특별자치도' as Region, label: '제주특별자치도' },
] as const;

export const REGION_TEXT: RegionTextMap = {
  서울: '서울',
  경기: '경기',
  인천: '인천',
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

// 외상 한도 상수 및 객체 추가
export const CREDIT_LIMIT = 10_000_000;
export const CREDIT_CONSTANTS = {
  CREDIT_LIMIT,
} as const;
