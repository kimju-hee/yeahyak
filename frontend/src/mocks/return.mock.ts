import type { Return, ReturnItem } from './types';

export const mockReturns: Return[] = [
  {
    id: 1,
    pharmacyId: 1, // 현정약국
    createdAt: '2025-06-27T15:00:00Z',
    reason: '재고 과다로 인한 반품',
    totalPrice: 51000,
    status: 'COMPLETED',
    updatedAt: '2025-07-04T15:00:00Z',
  },
  {
    id: 2,
    pharmacyId: 2, // 원섭약국
    createdAt: '2025-07-28T16:00:00Z',
    reason: '제품 파손',
    totalPrice: 16000,
    status: 'REQUESTED',
    updatedAt: undefined,
  },
];

export const mockReturnItems: ReturnItem[] = [
  {
    id: 1,
    returnId: 1,
    productId: 1, // 타이레놀 500mg
    quantity: 30,
    unitPrice: 500,
    subtotalPrice: 15000,
  },
  {
    id: 2,
    returnId: 1,
    productId: 5, // 박카스 D
    quantity: 40,
    unitPrice: 900,
    subtotalPrice: 36000,
  },
  {
    id: 3,
    returnId: 2,
    productId: 2, // 어린이 부루펜 시럽
    quantity: 100,
    unitPrice: 800,
    subtotalPrice: 80000,
  },
];
