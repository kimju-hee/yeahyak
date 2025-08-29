import type {
  BalanceTxTypeColorMap,
  OrderStatusColorMap,
  PharmacyRequestStatusColorMap,
  ReturnStatusColorMap,
} from '../types';

export const PHARMACY_REQUEST_STATUS_COLORS: PharmacyRequestStatusColorMap = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'default',
} as const;

export const ORDER_STATUS_COLORS: OrderStatusColorMap = {
  REQUESTED: 'orange',
  APPROVED: 'blue',
  PREPARING: 'blue',
  SHIPPING: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'default',
} as const;

export const RETURN_STATUS_COLORS: ReturnStatusColorMap = {
  REQUESTED: 'orange',
  APPROVED: 'blue',
  RECEIVED: 'blue',
  COMPLETED: 'green',
  CANCELED: 'default',
} as const;

export const BALANCE_TX_TYPE_COLORS: BalanceTxTypeColorMap = {
  ORDER: 'magenta',
  ORDER_CANCEL: 'gold',
  RETURN: 'green',
  SETTLEMENT: 'blue',
} as const;
