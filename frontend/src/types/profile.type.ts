export interface User {
  userId: number;
  email: string;
  point: number;
  role: 'BRANCH' | 'ADMIN';
}

export type UserRole = keyof typeof USER_ROLE;

export const USER_ROLE = {
  BRANCH: 'BRANCH',
  ADMIN: 'ADMIN',
} as const;

export interface Pharmacy {
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

export type PharmacyStatus = keyof typeof PHARMACY_STATUS;

export const PHARMACY_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
} as const;

export interface Admin {
  adminId: number;
  userId: number;
  adminName: string;
  department: AdminDepartment;
}

export type AdminDepartment = keyof typeof ADMIN_DEPARTMENT;

export const ADMIN_DEPARTMENT = {
  운영팀: '운영팀',
  총무팀: '총무팀',
} as const;

export interface AdminProfileUpdateRequest {
  adminId: number;
  userId: number;
  adminName: string;
  department: AdminDepartment;
}

export interface PharmacyProfileUpdateRequest {
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
