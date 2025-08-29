import type {
  BalanceTxTypeTextMap,
  DepartmentTextMap,
  InventoryTxTypeTextMap,
  MainCategoryTextMap,
  NoticeTypeTextMap,
  OrderStatusTextMap,
  PharmacyRequestStatusTextMap,
  RegionTextMap,
  ReturnStatusTextMap,
  SubCategoryTextMap,
} from '../types';

export const DEPARTMENT_TEXT: DepartmentTextMap = {
  FRANCHISE: '가맹관리부',
  LOGISTICS: '물류관리부',
  MARKETING: '마케팅부',
  SUPPORT: '경영지원부',
  FINANCE: '재무부',
} as const;

export const REGION_TEXT: RegionTextMap = {
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

export const PHARMACY_REQUEST_STATUS_TEXT: PharmacyRequestStatusTextMap = {
  PENDING: '대기',
  APPROVED: '활성',
  REJECTED: '반려',
} as const;

export const NOTICE_TYPE_TEXT: NoticeTypeTextMap = {
  GENERAL: '안내',
  LAW: '법령',
  EPIDEMIC: '감염병',
  NEW_PRODUCT: '신제품',
} as const;

export const ORDER_STATUS_TEXT: OrderStatusTextMap = {
  REQUESTED: '대기',
  APPROVED: '승인',
  PREPARING: '준비중',
  SHIPPING: '배송중',
  COMPLETED: '완료',
  CANCELED: '취소',
} as const;

export const RETURN_STATUS_TEXT: ReturnStatusTextMap = {
  REQUESTED: '대기',
  APPROVED: '승인',
  RECEIVED: '검토중',
  COMPLETED: '완료',
  CANCELED: '취소',
} as const;

export const BALANCE_TX_TYPE_TEXT: BalanceTxTypeTextMap = {
  ORDER: '발주',
  ORDER_CANCEL: '발주 취소',
  RETURN: '반품',
  SETTLEMENT: '정산',
} as const;

export const INVENTORY_TX_TYPE_TEXT: InventoryTxTypeTextMap = {
  ORDER: '발주',
  ORDER_CANCEL: '발주 취소',
  RETURN: '반품',
  IN: '입고',
} as const;

export const MAIN_CATEGORY_TEXT: MainCategoryTextMap = {
  전문의약품: '전문의약품',
  일반의약품: '일반의약품',
  의약외품: '의약외품',
} as const;

export const SUB_CATEGORY_TEXT: SubCategoryTextMap = {
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
