export interface CartItem {
  productId: number;
  productName: string;
  productCode: string;
  manufacturer: string;
  unitPrice: number;
  quantity: number;
  subtotalPrice: number;
  productImgUrl?: string;
}

export const ORDER_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;

// 발주 POST
export interface OrderRequest {
  pharmacyId: number;
  items: OrderItemRequest[];
}

// 발주 POST
export interface OrderItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

// 발주 목록 GET
export interface OrderResponse {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  updatedAt?: string;
  items: OrderItemResponse[];
}

// 발주 목록 GET
export interface OrderItemResponse {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

// 발주 상세 GET
export interface OrderDetailResponse {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  updatedAt?: string;
  items: OrderItemDetailResponse[];
}

// 발주 상세 GET
export interface OrderItemDetailResponse {
  productId: number;
  productName: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
  mainCategory: string;
  subCategory: string;
}
