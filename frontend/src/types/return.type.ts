export interface Return {
  returnId: number;
  pharmacyId: number;
  createdAt: string;
  totalPrice: number;
  status: ReturnStatus;
  updatedAt?: string;
}

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;
export type ReturnStatus = keyof typeof RETURN_STATUS;

export interface ReturnItem {
  returnItemId: number;
  returnId: number;
  productId: number;
  reason: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnRequest {
  pharmacyId: number;
  orderId: number;
  reason: string;
  items: ReturnItemRequest[];
}

export interface ReturnItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface ReturnResponse {
  returnId: number;
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  totalPrice: number;
  status: ReturnStatus;
  createdAt: string;
  updatedAt?: string;
  items: ReturnItemResponse[];
}

export interface ReturnItemResponse {
  productId: number;
  productName: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}
