import type { Department, DepartmentTextMap } from '../types';

export const AUTH_ENDPOINT = {
  PHARMACY_SIGNUP: '/auth/pharmacy/signup',
  ADMIN_SIGNUP: '/auth/admin/signup',
  PHARMACY_LOGIN: '/auth/pharmacy/login',
  ADMIN_LOGIN: '/auth/admin/login',
  PASSWORD_CHANGE: '/auth/password',
  PHARMACY_UPDATE: (pharmacyId: number) => `/auth/pharmacy/${pharmacyId}`,
  ADMIN_UPDATE: (adminId: number) => `/auth/admin/${adminId}`,
  LOGOUT: '/auth/logout',
} as const;

export const DEPARTMENT_OPTIONS = [
  { value: 'MANAGEMENT' as Department, label: '운영팀' },
  { value: 'SALES' as Department, label: '영업팀' },
  { value: 'INVENTORY' as Department, label: '재고팀' },
  { value: 'FINANCE' as Department, label: '재무팀' },
] as const;

export const DEPARTMENT_TEXT: DepartmentTextMap = {
  MANAGEMENT: '운영팀',
  SALES: '영업팀',
  INVENTORY: '재고팀',
  FINANCE: '재무팀',
} as const;
