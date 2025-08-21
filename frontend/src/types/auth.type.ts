import type { ApiResponse } from './api.type';
import type { Admin, AdminDepartment, Pharmacy, User } from './profile.type';

// 회원가입 요청 및 응답
export interface BranchSignupRequest {
  email: string;
  password: string;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress?: string;
  contact: string;
}

export interface AdminSignupRequest {
  email: string;
  password: string;
  adminName: string;
  department: AdminDepartment;
}

export type SignupResponse = ApiResponse<string>;

// 로그인 요청 및 응답
export interface LoginRequest {
  email: string;
  password: string;
}

export interface BranchLoginResponse {
  accessToken: string;
  user: User;
  profile: Pharmacy;
}

export interface AdminLoginResponse {
  accessToken: string;
  user: User;
  profile: Admin;
}

export type LoginResponse = ApiResponse<BranchLoginResponse | AdminLoginResponse>;

// 비밀번호 변경 요청 및 응답
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export type PasswordChangeResponse = ApiResponse<string>;

// 로그아웃 응답
export type LogoutResponse = ApiResponse<string>;
