import type { ReturnStatus, ReturnStatusColorMap, ReturnStatusTextMap } from '../types';

export const RETURN_ENDPOINT = {
  CREATE: '/returns',
  LIST_BRANCH: '/branch/returns',
  LIST_ADMIN: '/admin/returns',
  DETAIL_BRANCH: (returnId: number) => `/branch/returns/${returnId}`,
  DETAIL_ADMIN: (returnId: number) => `/admin/returns/${returnId}`,
  APPROVE: (returnId: number) => `/admin/returns/${returnId}/approve`,
  REJECT: (returnId: number) => `/admin/returns/${returnId}/reject`,
  UPDATE_STATUS: (returnId: number) => `/admin/returns/${returnId}`,
  DELETE: (returnId: number) => `/admin/returns/${returnId}`,
} as const;

export const RETURN_STATUS_OPTIONS = [
  { value: 'REQUESTED' as ReturnStatus, label: '대기' },
  { value: 'APPROVED' as ReturnStatus, label: '승인' },
  { value: 'PROCESSING' as ReturnStatus, label: '처리중' },
  { value: 'COMPLETED' as ReturnStatus, label: '완료' },
  { value: 'REJECTED' as ReturnStatus, label: '반려' },
] as const;

export const RETURN_STATUS_COLORS: ReturnStatusColorMap = {
  REQUESTED: 'orange',
  APPROVED: 'blue',
  PROCESSING: 'blue',
  COMPLETED: 'green',
  REJECTED: 'default',
} as const;

export const RETURN_STATUS_TEXT: ReturnStatusTextMap = {
  REQUESTED: '대기',
  APPROVED: '승인',
  PROCESSING: '처리중',
  COMPLETED: '완료',
  REJECTED: '반려',
} as const;

export const RETURN_REASON_OPTIONS = [
  { value: '제품 불량', label: '제품 불량' },
  { value: '오배송', label: '오배송' },
  { value: '고객 단순 변심', label: '고객 단순 변심' },
  { value: '주문 실수', label: '주문 실수' },
] as const;
