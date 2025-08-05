import type { AdminDepartment } from './profile.type';

export interface SignupRequest {
  email: string;
  password: string;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress: string;
  contact: string;
}

export interface AdminSignupRequest {
  email: string;
  password: string;
  adminName: string;
  department: AdminDepartment;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
