import type { PaginatedResponse } from './api.type';

export interface Product {
  productId: number;
  productName: string;
  productCode: string;
  mainCategory: ProductMainCategory;
  subCategory: ProductSubCategory;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  details?: string;
  productImgUrl?: string;
  createdAt: string;
  stock: number;
}

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

export type ProductMainCategory = keyof typeof PRODUCT_CATEGORIES;
export type ProductMainCategoryTextMap = { [key in ProductMainCategory]: string };

export type ProductSubCategory = (typeof PRODUCT_CATEGORIES)[ProductMainCategory][number];
export type ProductSubCategoryTextMap = { [key in ProductSubCategory]: string };

export type ProductSubCategoryWithAll = '전체' | ProductSubCategory;

export interface ProductCreateRequest {
  productName: string;
  productCode: string;
  mainCategory: ProductMainCategory;
  subCategory: ProductSubCategory;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  details?: string;
  productImgUrl?: string;
  stock: number;
}

export interface ProductListParams {
  page?: number;
  size?: number;
  mainCategory?: ProductMainCategory;
  subCategory?: ProductSubCategory;
  keyword?: string;
}

export interface ProductUpdateRequest {
  productName: string;
  productCode: string;
  mainCategory: ProductMainCategory;
  subCategory: ProductSubCategory;
  manufacturer: string;
  unit: string;
  unitPrice: number;
  details?: string;
  productImgUrl?: string;
  stock: number;
}

export type ProductCreateResponse = PaginatedResponse<number>;
export type ProductListResponse = PaginatedResponse<Product>;
export type ProductDetailResponse = PaginatedResponse<Product>;
export type ProductUpdateResponse = PaginatedResponse<Product>;
export type ProductDeleteResponse = PaginatedResponse<string>;
