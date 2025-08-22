import type { ApiResponse } from './api.type';

export interface User {
  userId: number;
  email: string;
  role: UserRole;
  point: number;
  creditStatus: UserCreditStatus;
}

export const USER_ROLE = {
  BRANCH: 'BRANCH',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = keyof typeof USER_ROLE;

export const USER_CREDIT_STATUS = {
  FULL: 'FULL',
  SETTLEMENT_REQUIRED: 'SETTLEMENT_REQUIRED',
} as const;
export type UserCreditStatus = keyof typeof USER_CREDIT_STATUS;
export type UserCreditStatusColorMap = { [key in UserCreditStatus]: string };
export type UserCreditStatusTextMap = { [key in UserCreditStatus]: string };

export interface Pharmacy {
  pharmacyId: number;
  userId: number;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  contact: string;
  status: PharmacyStatus;
}

export const PHARMACY_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
} as const;
export type PharmacyStatus = keyof typeof PHARMACY_STATUS;
export type PharmacyStatusColorMap = { [key in PharmacyStatus]: string };
export type PharmacyStatusTextMap = { [key in PharmacyStatus]: string };

export interface Admin {
  adminId: number;
  userId: number;
  adminName: string;
  department: AdminDepartment;
}

export const ADMIN_DEPARTMENT = {
  운영팀: '운영팀',
  총무팀: '총무팀',
} as const;
export type AdminDepartment = keyof typeof ADMIN_DEPARTMENT;
export type AdminDepartmentTextMap = { [key in AdminDepartment]: string };

// 프로필 수정 요청 및 응답
export interface BranchProfileUpdateRequest {
  pharmacyId: number;
  userId: number;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress: string;
  contact: string;
  status: PharmacyStatus;
}

export interface AdminProfileUpdateRequest {
  adminId: number;
  userId: number;
  adminName: string;
  department: AdminDepartment;
}

export type BranchProfileUpdateResponse = ApiResponse<Pharmacy>;
export type AdminProfileUpdateResponse = ApiResponse<Admin>;
