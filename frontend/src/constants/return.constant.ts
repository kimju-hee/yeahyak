import type { ReturnStatus, ReturnStatusColorMap, ReturnStatusTextMap } from '../types';

export const RETURN_ENDPOINT = {
  CREATE: '/returns',
  LIST_HQ: '/returns/hq',
  LIST_BRANCH: '/returns/branch',
  DETAIL: (returnId: number) => `/returns/${returnId}`,
  UPDATE: (returnId: number) => `/returns/${returnId}/status`,
  DELETE: (returnId: number) => `/returns/${returnId}`,
} as const;

export const RETURN_STATUS_OPTIONS = [
  { value: 'REQUESTED' as ReturnStatus, label: '대기' },
  { value: 'APPROVED' as ReturnStatus, label: '승인' },
  { value: 'RECEIVED' as ReturnStatus, label: '수령' },
  { value: 'COMPLETED' as ReturnStatus, label: '완료' },
  { value: 'CANCELED' as ReturnStatus, label: '취소' },
] as const;

export const RETURN_STATUS_COLORS: ReturnStatusColorMap = {
  REQUESTED: 'orange',
  APPROVED: 'blue',
  RECEIVED: 'blue',
  COMPLETED: 'green',
  CANCELED: 'default',
} as const;

export const RETURN_STATUS_TEXT: ReturnStatusTextMap = {
  REQUESTED: '대기',
  APPROVED: '승인',
  RECEIVED: '수령',
  COMPLETED: '완료',
  CANCELED: '취소',
} as const;

export const RETURN_REASON_OPTIONS = [
  { value: '제품 불량', label: '제품 불량' },
  { value: '오배송', label: '오배송' },
  { value: '고객 단순 변심', label: '고객 단순 변심' },
  { value: '주문 실수', label: '주문 실수' },
] as const;
