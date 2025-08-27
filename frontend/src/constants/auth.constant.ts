import type { AdminDepartment, AdminDepartmentTextMap } from '../types';

export const AUTH_ENDPOINT = {
  PHARMACY_SIGNUP: '/auth/pharmacy/signup',
  ADMIN_SIGNUP: '/auth/admin/signup',
  PHARMACY_LOGIN: '/auth/pharmacy/login',
  ADMIN_LOGIN: '/auth/admin/login',
  PASSWORD_CHANGE: '/auth/password',
  PHARMACY_UPDATE: (pharmacyId: number) => `/auth/pharmacy/${pharmacyId}`,
  ADMIN_UPDATE: (adminId: number) => `/auth/admin/${adminId}`,
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
} as const;

export const ADMIN_DEPARTMENT_OPTIONS = [
  { value: 'MANAGEMENT' as AdminDepartment, label: '운영' },
  { value: 'SALES' as AdminDepartment, label: '영업' },
  { value: 'INVENTORY' as AdminDepartment, label: '재고' },
  { value: 'FINANCE' as AdminDepartment, label: '재무' },
] as const;

export const ADMIN_DEPARTMENT_TEXT: AdminDepartmentTextMap = {
  MANAGEMENT: '운영',
  SALES: '영업',
  INVENTORY: '재고',
  FINANCE: '재무',
} as const;
