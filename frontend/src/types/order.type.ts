export interface Order {
  orderId: number;
  pharmacyId: number;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  updatedAt?: string;
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

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  productCode: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
  productImgUrl?: string;
}

export interface OrderRequest {
  pharmacyId: number;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface OrderListResponse {
  orderId: number;
  pharmacyId: number;
  pharmacyName: string;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  updatedAt?: string;
  items: OrderItemListResponse[];
}

export interface OrderItemListResponse {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

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

export interface OrderItemDetailResponse {
  productId: number;
  productName: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}
