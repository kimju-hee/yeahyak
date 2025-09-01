import { SUB_CATEGORY_TEXT } from '.';
import {
  PRODUCT_CATEGORIES,
  type BalanceTxType,
  type Department,
  type InventoryTxType,
  type MainCategory,
  type NoticeType,
  type OrderStatus,
  type PharmacyRequestStatus,
  type Region,
  type ReturnStatus,
} from '../types';

export const DEPARTMENT_OPTIONS = [
  { value: 'FRANCHISE' as Department, label: '가맹관리부' },
  { value: 'LOGISTICS' as Department, label: '물류관리부' },
  { value: 'MARKETING' as Department, label: '마케팅부' },
  { value: 'SUPPORT' as Department, label: '경영지원부' },
  { value: 'FINANCE' as Department, label: '재무부' },
] as const;

export const REGION_OPTIONS = [
  { value: '서울' as Region, label: '서울' },
  { value: '경기' as Region, label: '경기' },
  { value: '인천' as Region, label: '인천' },
  { value: '강원특별자치도' as Region, label: '강원특별자치도' },
  { value: '충북' as Region, label: '충북' },
  { value: '세종특별자치시' as Region, label: '세종특별자치시' },
  { value: '충남' as Region, label: '충남' },
  { value: '대전' as Region, label: '대전' },
  { value: '경북' as Region, label: '경북' },
  { value: '대구' as Region, label: '대구' },
  { value: '울산' as Region, label: '울산' },
  { value: '부산' as Region, label: '부산' },
  { value: '경남' as Region, label: '경남' },
  { value: '전북특별자치도' as Region, label: '전북특별자치도' },
  { value: '전남' as Region, label: '전남' },
  { value: '광주' as Region, label: '광주' },
  { value: '제주특별자치도' as Region, label: '제주특별자치도' },
] as const;

export const PHARMACY_REQUEST_STATUS_OPTIONS = [
  { value: 'PENDING' as PharmacyRequestStatus, label: '대기' },
  { value: 'APPROVED' as PharmacyRequestStatus, label: '활성' },
  { value: 'REJECTED' as PharmacyRequestStatus, label: '반려' },
] as const;

export const NOTICE_TYPE_OPTIONS = [
  { value: 'GENERAL' as NoticeType, label: '안내' },
  { value: 'LAW' as NoticeType, label: '법령' },
  { value: 'EPIDEMIC' as NoticeType, label: '감염병' },
  { value: 'NEW_PRODUCT' as NoticeType, label: '신제품' },
] as const;

export const ORDER_STATUS_OPTIONS = [
  { value: 'REQUESTED' as OrderStatus, label: '대기' },
  { value: 'APPROVED' as OrderStatus, label: '승인' },
  { value: 'PREPARING' as OrderStatus, label: '준비중' },
  { value: 'SHIPPING' as OrderStatus, label: '배송중' },
  { value: 'COMPLETED' as OrderStatus, label: '완료' },
  { value: 'CANCELED' as OrderStatus, label: '취소' },
] as const;

export const RETURN_STATUS_OPTIONS = [
  { value: 'REQUESTED' as ReturnStatus, label: '대기' },
  { value: 'APPROVED' as ReturnStatus, label: '승인' },
  { value: 'RECEIVED' as ReturnStatus, label: '검토중' },
  { value: 'COMPLETED' as ReturnStatus, label: '완료' },
  { value: 'CANCELED' as ReturnStatus, label: '취소' },
] as const;

export const RETURN_REASON_OPTIONS = [
  { value: '제품 불량', label: '제품 불량' },
  { value: '오배송', label: '오배송' },
  { value: '고객 단순 변심', label: '고객 단순 변심' },
  { value: '주문 실수', label: '주문 실수' },
] as const;

export const BALANCE_TX_TYPE_OPTIONS = [
  { value: 'ORDER' as BalanceTxType, label: '발주' },
  { value: 'ORDER_CANCEL' as BalanceTxType, label: '발주 취소' },
  { value: 'RETURN' as BalanceTxType, label: '반품' },
  { value: 'SETTLEMENT' as BalanceTxType, label: '정산' },
] as const;

export const INVENTORY_TX_TYPE_OPTIONS = [
  { value: 'ORDER' as InventoryTxType, label: '발주' },
  { value: 'ORDER_CANCEL' as InventoryTxType, label: '발주 취소' },
  { value: 'RETURN' as InventoryTxType, label: '반품' },
  { value: 'IN' as InventoryTxType, label: '입고' },
] as const;

export const MAIN_CATEGORY_OPTIONS = [
  { value: '전문의약품' as MainCategory, label: '전문의약품' },
  { value: '일반의약품' as MainCategory, label: '일반의약품' },
  { value: '의약외품' as MainCategory, label: '의약외품' },
] as const;

// 메인 카테고리에 따른 서브 카테고리 옵션을 반환하는 함수
export const getProductSubCategoryOptions = (mainCategory: MainCategory) => {
  return PRODUCT_CATEGORIES[mainCategory].map((subCategory) => ({
    value: subCategory,
    label: SUB_CATEGORY_TEXT[subCategory],
  }));
};
