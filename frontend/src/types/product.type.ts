export interface Product {
  productId: number;
  productName: string;
  productCode: string;
  manufacturer: string;
  mainCategory: ProductMainCategory;
  subCategory: ProductSubCategory;
  details?: string;
  unit: string;
  unitPrice: number;
  createdAt: string;
  isNarcotic: boolean;
  productImgUrl?: string;
}

export const PRODUCT_MAIN_CATEGORY = {
  전문의약품: '전문의약품',
  일반의약품: '일반의약품',
  의약외품: '의약외품',
} as const;

export type ProductMainCategory = keyof typeof PRODUCT_MAIN_CATEGORY;

export const PRODUCT_SUB_CATEGORY = {
  전문의약품: [
    '항생제',
    '고혈압_치료제',
    '당뇨병_치료제',
    '진통소염제',
    '정신신경용제',
    '항암제',
    '기타_전문의약품',
  ],
  일반의약품: [
    '감기약',
    '소화제',
    '해열진통제',
    '지사제',
    '외용제',
    '멀미약',
    '기타_일반의약품',
  ],
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

export type ProductSubCategory =
  | (typeof PRODUCT_SUB_CATEGORY.전문의약품)[number]
  | (typeof PRODUCT_SUB_CATEGORY.일반의약품)[number]
  | (typeof PRODUCT_SUB_CATEGORY.의약외품)[number];

export type ProductSubCategoryWithAll = '전체' | ProductSubCategory;

export interface ProductRequest {
  productName: string;
  productCode: string;
  manufacturer: string;
  mainCategory: ProductMainCategory;
  subCategory: ProductSubCategory;
  details?: string;
  unit: string;
  unitPrice: number;
  isNarcotic: boolean;
  productImgUrl?: string;
}

export interface ProductResponse {
  productId: number;
  productName: string;
  productCode: string;
  manufacturer: string;
  mainCategory: ProductMainCategory;
  subCategory: ProductSubCategory;
  details?: string;
  unit: string;
  unitPrice: number;
  createdAt: string;
  isNarcotic: boolean;
  productImgUrl?: string;
}
