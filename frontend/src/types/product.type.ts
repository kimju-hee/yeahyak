import type { ApiResponse, InventoryTxType, MainCategory, PaginatedResponse, SubCategory } from '.';

export interface ProductCreateRequest {
  productName: string;
  insuranceCode: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  details?: string;
  productImgUrl?: string;
  inventoryQty: number;
}

export interface ProductCreate {
  productId: number;
  inventoryTxId: number;
}

export interface ProductListParams {
  mainCategory: MainCategory;
  subCategory?: SubCategory;
  keyword?: string; // 제품명
  threshold?: number; // 재고 임계값
  page?: number;
  size?: number;
}

export interface ProductList {
  productId: number;
  productName: string;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  productImgUrl?: string;
  inventoryQty: number;
  latestInventoryInAt: string;
}

export interface ProductDetail {
  productId: number;
  productName: string;
  insuranceCode: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  details?: string;
  productImgUrl?: string;
  createdAt: string;
  inventoryQty: number;
}

export interface ProductUpdateRequest {
  productName: string;
  insuranceCode: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  details?: string;
  productImgUrl?: string;
}

export type ProductCreateResponse = ApiResponse<ProductCreate>;
export type ProductListResponse = PaginatedResponse<ProductList>;
export type ProductDetailResponse = ApiResponse<ProductDetail>;

export interface InventoryInRequest {
  amount: number;
}

export interface InventoryIn {
  inventoryTxId: number;
  productId: number;
  amount: number;
  inventoryBefore: number;
  inventoryAfter: number;
  createdAt: string;
}

export interface InventoryTxParams {
  page?: number;
  size?: number;
}

export interface InventoryTx {
  inventoryTxId: number;
  productId: number;
  productName: string;
  type: InventoryTxType;
  amount: number;
  inventoryAfter: number;
  createdAt: string;
}

export type InventoryInResponse = ApiResponse<InventoryIn>;
export type InventoryTxResponse = PaginatedResponse<InventoryTx>;
