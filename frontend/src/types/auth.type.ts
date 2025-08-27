import type { Region } from '.';
import type { ApiResponse } from './api.type';

export interface User {
  userId: number;
  email: string;
  role: UserRole;
}

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  PHARMACY: 'PHARMACY',
} as const;
export type UserRole = keyof typeof USER_ROLE;

export interface Admin {
  adminId: number;
  adminName: string;
  department: AdminDepartment;
}

export const ADMIN_DEPARTMENT = {
  MANAGEMENT: 'MANAGEMENT',
  SALES: 'SALES',
  INVENTORY: 'INVENTORY',
  FINANCE: 'FINANCE',
} as const;
export type AdminDepartment = keyof typeof ADMIN_DEPARTMENT;
export type AdminDepartmentTextMap = { [key in AdminDepartment]: string };

export interface Pharmacy {
  pharmacyId: number;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  region: Region;
  contact: string;
  outstandingBalance: number;
}

// 회원가입 요청 및 응답
export interface AdminSignupReq {
  email: string;
  password: string;
  adminName: string;
  department: AdminDepartment;
}

export interface PharmacySignupReq {
  email: string;
  password: string;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  region: Region;
  contact: string;
}

export interface AdminSignupRes {
  userId: number;
  adminId: number;
}

export interface PharmacySignupRes {
  userId: number;
  pharmacyRequestId: number;
}

export type SignupResponse = ApiResponse<AdminSignupRes | PharmacySignupRes>;

// 로그인 요청 및 응답
export interface LoginReq {
  email: string;
  password: string;
}

export interface AdminLoginRes {
  accessToken: string;
  user: User;
  profile: Admin;
}

export interface PharmacyLoginRes {
  accessToken: string;
  user: User;
  profile: Pharmacy;
}

export type LoginResponse = ApiResponse<PharmacyLoginRes | AdminLoginRes>;

// 비밀번호 변경 요청 및 응답
export interface PasswordChangeReq {
  currentPassword: string;
  newPassword: string;
}

// 프로필 수정 요청 및 응답
export interface AdminUpdateReq {
  adminName: string;
  department: AdminDepartment;
}

export interface PharmacyUpdateReq {
  pharmacyName: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  region: Region;
  contact: string;
}
