export interface ReturnCartItem {
  productId: number;
  productName: string;
  manufacturer: string;
  mainCategory: string;
  subCategory: string;
  unitPrice: number;
  quantity: number;
  subtotalPrice: number;
}

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
} as const;
export type ReturnStatus = keyof typeof RETURN_STATUS;

// 반품 POST
export interface ReturnRequest {
  pharmacyId: number;
  orderId: number;
  reason: string;
  items: ReturnItemRequest[];
}

// 반품 POST
export interface ReturnItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

// 반품 목록 GET
export interface ReturnResponse {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  orderId: number;
  createdAt: string;
  totalPrice: number;
  status: ReturnStatus;
  items: ReturnItemResponse[];
  reason: string;
}

// 반품 목록 GET
export interface ReturnItemResponse {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

// 반품 상세 GET
export interface ReturnDetailResponse {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  orderId: number;
  createdAt: string;
  updatedAt?: string;
  totalPrice: number;
  status: ReturnStatus;
  items: ReturnItemDetailResponse[];
  reason: string;
}

// 반품 상세 GET
export interface ReturnItemDetailResponse {
  productId: number;
  productName: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}
