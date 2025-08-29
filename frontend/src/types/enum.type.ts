export const USER_ROLE = {
  ADMIN: 'ADMIN',
  PHARMACY: 'PHARMACY',
} as const;
export type UserRole = keyof typeof USER_ROLE;
export type UserRoleTextMap = { [key in UserRole]: string };

export const DEPARTMENT = {
  FRANCHISE: 'FRANCHISE',
  LOGISTICS: 'LOGISTICS',
  MARKETING: 'MARKETING',
  SUPPORT: 'SUPPORT',
  FINANCE: 'FINANCE',
} as const;
export type Department = keyof typeof DEPARTMENT;
export type DepartmentTextMap = { [key in Department]: string };

export const REGION = {
  서울: '서울',
  경기: '경기',
  인천: '인천',
  강원특별자치도: '강원특별자치도',
  충북: '충북',
  세종특별자치시: '세종특별자치시',
  충남: '충남',
  대전: '대전',
  경북: '경북',
  대구: '대구',
  울산: '울산',
  부산: '부산',
  경남: '경남',
  전북특별자치도: '전북특별자치도',
  전남: '전남',
  광주: '광주',
  제주특별자치도: '제주특별자치도',
} as const;
export type Region = keyof typeof REGION;
export type RegionTextMap = { [key in Region]: string };

export const PHARMACY_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type PharmacyRequestStatus = keyof typeof PHARMACY_REQUEST_STATUS;
export type PharmacyRequestStatusTextMap = { [key in PharmacyRequestStatus]: string };
export type PharmacyRequestStatusColorMap = { [key in PharmacyRequestStatus]: string };

export const NOTICE_TYPE = {
  GENERAL: 'GENERAL',
  LAW: 'LAW',
  EPIDEMIC: 'EPIDEMIC',
  NEW_PRODUCT: 'NEW_PRODUCT',
} as const;
export type NoticeType = keyof typeof NOTICE_TYPE;
export type NoticeTypeTextMap = { [key in NoticeType]: string };

export const ORDER_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PREPARING: 'PREPARING',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;
export type OrderStatusTextMap = { [key in OrderStatus]: string };
export type OrderStatusColorMap = { [key in OrderStatus]: string };

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  RECEIVED: 'RECEIVED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;
export type ReturnStatus = keyof typeof RETURN_STATUS;
export type ReturnStatusTextMap = { [key in ReturnStatus]: string };
export type ReturnStatusColorMap = { [key in ReturnStatus]: string };

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

export const BALANCE_TX_TYPE = {
  ORDER: 'ORDER',
  ORDER_CANCEL: 'ORDER_CANCEL',
  RETURN: 'RETURN',
  SETTLEMENT: 'SETTLEMENT',
} as const;
export type BalanceTxType = keyof typeof BALANCE_TX_TYPE;
export type BalanceTxTypeTextMap = { [key in BalanceTxType]: string };
export type BalanceTxTypeColorMap = { [key in BalanceTxType]: string };

export const INVENTORY_TX_TYPE = {
  ORDER: 'ORDER',
  ORDER_CANCEL: 'ORDER_CANCEL',
  RETURN: 'RETURN',
  IN: 'IN',
} as const;
export type InventoryTxType = keyof typeof INVENTORY_TX_TYPE;
export type InventoryTxTypeTextMap = { [key in InventoryTxType]: string };
export type InventoryTxTypeColorMap = { [key in InventoryTxType]: string };

export const CHAT_TYPE = {
  FAQ: 'FAQ',
  QNA: 'QNA',
} as const;
export type ChatType = keyof typeof CHAT_TYPE;
export type ChatTypeTextMap = { [key in ChatType]: string };

export const CHAT_ROLE = {
  USER: 'USER',
  AI: 'AI',
} as const;
export type ChatRole = keyof typeof CHAT_ROLE;
export type ChatRoleTextMap = { [key in ChatRole]: string };
