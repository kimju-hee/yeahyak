export interface Return {
  returnId: number;
  pharmacyId: number;
  createdAt: string;
  totalPrice: number;
  status: ReturnStatus;
  updatedAt?: string;
}

export type ReturnStatus = keyof typeof RETURN_STATUS;

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

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
  items: ReturnItemRequest[];
}

export interface ReturnItemRequest {
  productId: number;
  reason: string;
  quantity: number;
  unitPrice: number;
}

export interface ReturnResponse {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  createdAt: string;
  totalPrice: number;
  status: ReturnStatus;
  updatedAt?: string;
  items: ReturnItemResponse[];
}

export interface ReturnItemResponse {
  productName: string;
  reason: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}
