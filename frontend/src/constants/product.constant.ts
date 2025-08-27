import {
  PRODUCT_CATEGORIES,
  type ProductMainCategory,
  type ProductMainCategoryTextMap,
  type ProductSubCategoryTextMap,
} from '../types';

export const PRODUCT_ENDPOINT = {
  CREATE: '/products',
  LIST: '/products',
  DETAIL: (productId: number) => `/products/${productId}`,
  UPDATE: (productId: number) => `/products/${productId}`,
  DELETE: (productId: number) => `/products/${productId}`,
} as const;

export const PRODUCT_MAIN_CATEGORY_OPTIONS = [
  { value: '전문의약품' as ProductMainCategory, label: '전문의약품' },
  { value: '일반의약품' as ProductMainCategory, label: '일반의약품' },
  { value: '의약외품' as ProductMainCategory, label: '의약외품' },
] as const;

export const PRODUCT_MAIN_CATEGORY_TEXT: ProductMainCategoryTextMap = {
  전문의약품: '전문의약품',
  일반의약품: '일반의약품',
  의약외품: '의약외품',
} as const;

// 메인 카테고리에 따른 서브 카테고리 옵션을 반환하는 함수
export const getProductSubCategoryOptions = (mainCategory: ProductMainCategory) => {
  return PRODUCT_CATEGORIES[mainCategory].map((subCategory) => ({
    value: subCategory,
    label: PRODUCT_SUB_CATEGORY_TEXT[subCategory],
  }));
};

export const PRODUCT_SUB_CATEGORY_TEXT: ProductSubCategoryTextMap = {
  // 전문의약품
  항생제: '항생제',
  고혈압_치료제: '고혈압 치료제',
  당뇨병_치료제: '당뇨병 치료제',
  진통소염제: '진통소염제',
  정신신경용제: '정신신경용제',
  항암제: '항암제',
  기타_전문의약품: '기타 전문의약품',

  // 일반의약품
  감기약: '감기약',
  소화제: '소화제',
  해열진통제: '해열진통제',
  지사제: '지사제',
  외용제: '외용제',
  멀미약: '멀미약',
  기타_일반의약품: '기타 일반의약품',

  // 의약외품
  마스크: '마스크',
  손소독제: '손소독제',
  밴드_반창고: '밴드/반창고',
  체온계: '체온계',
  구강청결제: '구강청결제',
  방역용품: '방역용품',
  기타_의약외품: '기타 의약외품',
} as const;
