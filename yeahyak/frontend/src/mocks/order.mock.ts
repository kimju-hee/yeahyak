import type { Order, OrderItem } from './types';

export const mockOrders: Order[] = [
  {
    id: 1,
    pharmacyId: 1,
    createdAt: '2025-01-27T10:00:00Z',
    totalPrice: 210000,
    status: 'COMPLETED',
    updatedAt: '2025-01-29T11:30:00Z',
  },
  {
    id: 2,
    pharmacyId: 2,
    createdAt: '2025-02-19T10:15:00Z',
    totalPrice: 440000,
    status: 'COMPLETED',
    updatedAt: '2025-02-22T11:45:00Z',
  },
  {
    id: 3,
    pharmacyId: 3,
    createdAt: '2025-03-22T10:30:00Z',
    totalPrice: 101100,
    status: 'COMPLETED',
    updatedAt: '2025-03-24T16:00:00Z',
  },
  {
    id: 4,
    pharmacyId: 2,
    createdAt: '2025-03-23T12:00:00Z',
    totalPrice: 807800,
    status: 'COMPLETED',
    updatedAt: '2025-03-26T13:30:00Z',
  },
  {
    id: 5,
    pharmacyId: 3,
    createdAt: '2025-07-26T11:00:00Z',
    totalPrice: 200000,
    status: 'SHIPPING',
    updatedAt: '2025-07-29T12:30:00Z',
  },
  {
    id: 6,
    pharmacyId: 4,
    createdAt: '2025-07-29T10:45:00Z',
    totalPrice: 871800,
    status: 'REQUESTED',
    updatedAt: undefined,
  },
];

export const mockOrderItems: OrderItem[] = [
  // Order 1 (현정약국, 210,000원)
  { id: 1, orderId: 1, productId: 1, quantity: 100, unitPrice: 500, subtotalPrice: 50000 }, // 타이레놀
  { id: 2, orderId: 1, productId: 5, quantity: 100, unitPrice: 900, subtotalPrice: 90000 }, // 박카스 D
  { id: 3, orderId: 1, productId: 6, quantity: 10, unitPrice: 7000, subtotalPrice: 70000 }, // 후시딘 연고
  // Order 2 (원섭약국, 440,000원)
  { id: 4, orderId: 2, productId: 2, quantity: 200, unitPrice: 800, subtotalPrice: 160000 }, // 어린이 부루펜
  { id: 5, orderId: 2, productId: 7, quantity: 50, unitPrice: 2500, subtotalPrice: 125000 }, // 메디폼 밴드
  { id: 6, orderId: 2, productId: 8, quantity: 80, unitPrice: 1800, subtotalPrice: 144000 }, // 알레그라
  { id: 7, orderId: 2, productId: 1, quantity: 22, unitPrice: 500, subtotalPrice: 11000 }, // 타이레놀
  // Order 3 (지윤약국, 101,100원)
  { id: 8, orderId: 3, productId: 1, quantity: 100, unitPrice: 500, subtotalPrice: 50000 }, // 타이레놀
  { id: 9, orderId: 3, productId: 5, quantity: 50, unitPrice: 900, subtotalPrice: 45000 }, // 박카스 D
  { id: 10, orderId: 3, productId: 3, quantity: 7, unitPrice: 700, subtotalPrice: 4900 }, // 아목시실린
  { id: 11, orderId: 3, productId: 4, quantity: 1, unitPrice: 1200, subtotalPrice: 1200 }, // 가스터
  // Order 4 (원섭약국, 807,800원)
  { id: 12, orderId: 4, productId: 9, quantity: 50, unitPrice: 9000, subtotalPrice: 450000 }, // 비판텐
  { id: 13, orderId: 4, productId: 10, quantity: 80, unitPrice: 4000, subtotalPrice: 320000 }, // 정로환
  { id: 14, orderId: 4, productId: 3, quantity: 42, unitPrice: 700, subtotalPrice: 29400 }, // 아목시실린
  { id: 15, orderId: 4, productId: 4, quantity: 7, unitPrice: 1200, subtotalPrice: 8400 }, // 가스터
  // Order 5 (지윤약국, 200,000원)
  { id: 16, orderId: 5, productId: 2, quantity: 100, unitPrice: 800, subtotalPrice: 80000 }, // 어린이 부루펜
  { id: 17, orderId: 5, productId: 6, quantity: 10, unitPrice: 7000, subtotalPrice: 70000 }, // 후시딘 연고
  { id: 18, orderId: 5, productId: 7, quantity: 20, unitPrice: 2500, subtotalPrice: 50000 }, // 메디폼 밴드
  // Order 6 (동현약국, 871,800원)
  { id: 19, orderId: 6, productId: 9, quantity: 50, unitPrice: 9000, subtotalPrice: 450000 }, // 비판텐
  { id: 20, orderId: 6, productId: 10, quantity: 80, unitPrice: 4000, subtotalPrice: 320000 }, // 정로환
  { id: 21, orderId: 6, productId: 8, quantity: 51, unitPrice: 1800, subtotalPrice: 91800 }, // 알레그라
  { id: 22, orderId: 6, productId: 1, quantity: 20, unitPrice: 500, subtotalPrice: 10000 }, // 타이레놀
];
