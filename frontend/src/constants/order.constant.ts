import type { OrderStatus, OrderStatusColorMap, OrderStatusTextMap } from '../types';

export const ORDER_ENDPOINT = {
  CREATE: '/orders',
  LIST_HQ: '/orders/hq',
  LIST_BRANCH: '/orders/branch',
  DETAIL: (orderId: number) => `/orders/${orderId}`,
  UPDATE: (orderId: number) => `/orders/${orderId}/status`,
  DELETE: (orderId: number) => `/orders/${orderId}`,
  FORECAST: '/forecast/order',
} as const;

export const ORDER_STATUS_OPTIONS = [
  { value: 'REQUESTED' as OrderStatus, label: '대기' },
  { value: 'APPROVED' as OrderStatus, label: '승인' },
  { value: 'PREPARING' as OrderStatus, label: '준비중' },
  { value: 'SHIPPING' as OrderStatus, label: '배송중' },
  { value: 'COMPLETED' as OrderStatus, label: '완료' },
  { value: 'CANCELED' as OrderStatus, label: '취소' },
] as const;

export const ORDER_STATUS_COLORS: OrderStatusColorMap = {
  REQUESTED: 'orange',
  APPROVED: 'blue',
  PREPARING: 'blue',
  SHIPPING: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'default',
} as const;

export const ORDER_STATUS_TEXT: OrderStatusTextMap = {
  REQUESTED: '대기',
  APPROVED: '승인',
  PREPARING: '준비중',
  SHIPPING: '배송중',
  COMPLETED: '완료',
  CANCELED: '취소',
} as const;
