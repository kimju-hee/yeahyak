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
  department: Department;
}

export const DEPARTMENT = {
  MANAGEMENT: 'MANAGEMENT',
  SALES: 'SALES',
  INVENTORY: 'INVENTORY',
  FINANCE: 'FINANCE',
} as const;
export type Department = keyof typeof DEPARTMENT;
export type DepartmentTextMap = { [key in Department]: string };

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
export interface AdminSignupRequest {
  email: string;
  password: string;
  adminName: string;
  department: Department;
}

export interface PharmacySignupRequest {
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

export interface AdminSignup {
  userId: number;
  adminId: number;
}

export interface PharmacySignup {
  userId: number;
  pharmacyRequestId: number;
}

export type SignupResponse = ApiResponse<AdminSignup | PharmacySignup>;

// 로그인 요청 및 응답
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLogin {
  accessToken: string;
  user: User;
  profile: Admin;
}

export interface PharmacyLogin {
  accessToken: string;
  user: User;
  profile: Pharmacy;
}

export type LoginResponse = ApiResponse<PharmacyLogin | AdminLogin>;

// 토큰 갱신 응답
export interface RefreshToken {
  accessToken: string;
}

export type RefreshTokenResponse = ApiResponse<RefreshToken>;

// 비밀번호 변경 요청 및 응답
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// 프로필 수정 요청 및 응답
export interface AdminUpdateRequest {
  adminName: string;
  department: Department;
}

export interface PharmacyUpdateRequest {
  pharmacyName: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  region: Region;
  contact: string;
}

export type AdminUpdateResponse = ApiResponse<Admin>;
export type PharmacyUpdateResponse = ApiResponse<Pharmacy>;
