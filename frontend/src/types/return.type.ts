import type {
  ApiResponse,
  MainCategory,
  PaginatedResponse,
  Region,
  ReturnStatus,
  SubCategory,
} from '.';

export interface ReturnCartItem {
  productId: number;
  productName: string;
  manufacturer: string;
  productImgUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnCreateRequest {
  pharmacyId: number;
  orderId: number;
  reason: string;
  items: ReturnCreateRequestItem[];
}

export interface ReturnCreateRequestItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnCreate {
  returnId: number;
}

// CHECK: 파라미터 확인
export interface ReturnListHqParams {
  status?: ReturnStatus;
  region?: Region;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
}

// CHECK: 파라미터 확인
export interface ReturnListBranchParams {
  pharmacyId: number;
  status?: ReturnStatus;
  page?: number;
  size?: number;
}

export interface ReturnList {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: ReturnStatus;
  summary: string;
  reason: string;
  totalPrice: number;
  createdAt: string;
}

export interface ReturnDetail {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  status: ReturnStatus;
  summary: string;
  reason: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  items: ReturnDetailItem[];
}

export interface ReturnDetailItem {
  productId: number;
  productName: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  manufacturer: string;
  productImgUrl?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotalPrice: number;
}

export interface ReturnUpdateRequest {
  status: ReturnStatus;
}

export type ReturnCreateResponse = ApiResponse<ReturnCreate>;
export type ReturnListResponse = PaginatedResponse<ReturnList>;
export type ReturnDetailResponse = ApiResponse<ReturnDetail>;
