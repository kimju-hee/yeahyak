import type { ApiResponse, PaginatedResponse } from './api.type';

export const PRODUCT_CATEGORIES = {
  전문의약품: [
    '항생제',
    '고혈압_치료제',
    '당뇨병_치료제',
    '진통소염제',
    '정신신경용제',
    '항암제',
    '기타_전문의약품',
  ],
  일반의약품: ['감기약', '소화제', '해열진통제', '지사제', '외용제', '멀미약', '기타_일반의약품'],
  의약외품: [
    '마스크',
    '손소독제',
    '밴드_반창고',
    '체온계',
    '구강청결제',
    '방역용품',
    '기타_의약외품',
  ],
} as const;

export type MainCategory = keyof typeof PRODUCT_CATEGORIES;
export type MainCategoryTextMap = { [key in MainCategory]: string };

export type SubCategory = (typeof PRODUCT_CATEGORIES)[MainCategory][number];
export type SubCategoryTextMap = { [key in SubCategory]: string };

export type SubCategoryWithAll = '전체' | SubCategory;

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
  stockQty: number;
}

export interface ProductCreate {
  productId: number;
  stockTxId: number;
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
  stockQty: number;
}

export interface ProductListParams {
  page?: number;
  size?: number;
  mainCategory?: MainCategory;
  subCategory?: SubCategory;
  keyword?: string;
}

export interface ProductList {
  productId: number;
  productName: string;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  productImgUrl?: string;
  stockQty: number;
  latestStockInAt: string;
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
