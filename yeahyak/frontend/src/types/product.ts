export interface Product {
  id: number;
  productName: string;
  productCode: string;
  manufacturer: string;
  type: Type;
  subCategory: SubCategory;
  details?: string;
  unit: string;
  unitPrice: number;
  createdAt: string;
  productImgUrl?: string;
}

export type Type = '전문의약품' | '일반의약품' | '의약외품';

export const TYPES: Type[] = ['전문의약품', '일반의약품', '의약외품'];

export const SUB_CATEGORY_MAP = {
  전문의약품: [
    '항생제',
    '고혈압 치료제',
    '당뇨병 치료제',
    '진통·소염제',
    '정신신경용제',
    '항암제',
    '기타',
  ],
  일반의약품: ['감기약', '소화제', '해열진통제', '지사제', '외용제', '멀미약', '기타'],
  의약외품: ['마스크', '손소독제', '밴드·반창고', '체온계', '구강청결제', '방역용품', '기타'],
} as const;

export type SubCategoryMap = typeof SUB_CATEGORY_MAP;

export type SubCategory = SubCategoryMap[Type][number];

export type SubCategoryWithAll = '전체' | SubCategory;
