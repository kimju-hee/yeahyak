export interface User {
  id: number;
  email: string;
  password: String;
  balance?: number;
  role: 'ADMIN' | 'BRANCH';
}

export interface Admin {
  id: number;
  userId: number;
  adminName: string;
  department: string;
}

export interface Pharmacy {
  id: number;
  userId: number;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  address: string;
  contact?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PharmacyRegistraionRequest {
  id: number;
  pharmacyId: number;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
}

export interface Notice {
  id: number;
  category: 'NOTICE' | 'LAW' | 'EPIDEMIC';
  title: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LawSummary {
  id: number;
  title: string;
  content: string;
  attachmentUrl: string;
  createdAt: string;
}

export interface EpidemicSummary {
  id: number;
  title: string;
  content: string;
  attachmentUrl: string;
  createdAt: string;
}

export interface Product {
  id: number;
  productName: string;
  productCode: string;
  manufacturer?: string;
  drugType: 'ETC' | 'OTC';
  mfdsCategory?: string;
  details?: string;
  unit: string;
  unitPrice: number;
  createdAt: string;
}

export interface Order {
  id: number;
  pharmacyId: number;
  createdAt: string;
  totalPrice: number;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELED';
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface Return {
  id: number;
  pharmacyId: number;
  createdAt: string;
  reason: string;
  totalPrice: number;
  status: 'REQUESTED' | 'REJECTED' | 'APPROVED' | 'COMPLETED';
  updatedAt?: string;
}

export interface ReturnItem {
  id: number;
  returnId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface PharmacyStock {
  id: number;
  pharmacyId: number;
  productId: number;
  quantity: number;
  lastInboundedAt?: string;
  lastOutboundeAt?: string;
}

export interface PharmcayStockTransaction {
  id: number;
  pharmacyStockId: number;
  quantity: number;
  type: 'IN' | 'OUT' | 'RETURN_OUT';
  createdAt: string;
  orderId?: number;
  returnId?: number;
}

export interface HqStock {
  id: number;
  productId: number;
  quantity: number;
  lastInboundedAt?: string;
  lastOutboundedAt?: string;
}

export interface HqStockTransaction {
  id: number;
  hqStockId: number;
  quantity: number;
  type: 'IN' | 'OUT' | 'RETURN_IN';
  createdAt: string;
  orderId?: number;
  returnId?: number;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Chat {
  id: number;
  userId: number;
  type: 'FAQ' | 'QnA';
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  chatId: number;
  sender: 'USER' | 'BOT';
  content: string;
  sentAt: string;
}
