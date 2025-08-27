import type { OrderStatus, OrderStatusColorMap, OrderStatusTextMap } from '../types';

export const ORDER_ENDPOINT = {
  CREATE: '/orders',
  LIST_BRANCH: '/orders/branch/orders',
  LIST_ADMIN: '/orders/admin/orders',
  DETAIL: (orderId: number) => `/orders/${orderId}`,
  APPROVE: (orderId: number) => `/orders/${orderId}/approve`,
  REJECT: (orderId: number) => `/orders/${orderId}/reject`,
  UPDATE_STATUS: (orderId: number) => `/orders/${orderId}`,
  DELETE: (orderId: number) => `/orders/${orderId}`,
  FORECAST: '/forecast/order',
} as const;

export const ORDER_STATUS_OPTIONS = [
  { value: 'REQUESTED' as OrderStatus, label: '대기' },
  { value: 'APPROVED' as OrderStatus, label: '승인' },
  { value: 'PROCESSING' as OrderStatus, label: '처리중' },
  { value: 'SHIPPING' as OrderStatus, label: '배송중' },
  { value: 'COMPLETED' as OrderStatus, label: '완료' },
  { value: 'REJECTED' as OrderStatus, label: '반려' },
] as const;

export const ORDER_STATUS_COLORS: OrderStatusColorMap = {
  REQUESTED: 'orange',
  APPROVED: 'blue',
  PROCESSING: 'blue',
  SHIPPING: 'cyan',
  COMPLETED: 'green',
  REJECTED: 'default',
} as const;

export const ORDER_STATUS_TEXT: OrderStatusTextMap = {
  REQUESTED: '대기',
  APPROVED: '승인',
  PROCESSING: '처리중',
  SHIPPING: '배송중',
  COMPLETED: '완료',
  REJECTED: '반려',
} as const;
