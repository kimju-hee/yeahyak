import type {
  AdminDepartment,
  AdminDepartmentTextMap,
  PharmacyStatus,
  PharmacyStatusColorMap,
  PharmacyStatusTextMap,
  UserCreditStatus,
  UserCreditStatusColorMap,
  UserCreditStatusTextMap,
} from '../types';

export const PROFILE_ENDPOINT = {
  BRANCH_UPDATE: (pharmacyId: number) => `/auth/update/${pharmacyId}`,
  ADMIN_UPDATE: (adminId: number) => `/auth/update/admin/${adminId}`,
} as const;

export const USER_CREDIT_STATUS_OPTIONS = [
  { value: 'FULL' as UserCreditStatus, label: '정산완료' },
  { value: 'SETTLEMENT_REQUIRED' as UserCreditStatus, label: '정산필요' },
] as const;

export const USER_CREDIT_STATUS_COLORS: UserCreditStatusColorMap = {
  FULL: 'success',
  SETTLEMENT_REQUIRED: 'warning',
} as const;

export const USER_CREDIT_STATUS_TEXT: UserCreditStatusTextMap = {
  FULL: '정산완료',
  SETTLEMENT_REQUIRED: '정산필요',
} as const;

export const PHARMACY_STATUS_OPTIONS = [
  { value: 'PENDING' as PharmacyStatus, label: '대기' },
  { value: 'ACTIVE' as PharmacyStatus, label: '활성' },
  { value: 'REJECTED' as PharmacyStatus, label: '반려' },
] as const;

export const PHARMACY_STATUS_COLORS: PharmacyStatusColorMap = {
  PENDING: 'warning',
  ACTIVE: 'success',
  REJECTED: 'default',
} as const;

export const PHARMACY_STATUS_TEXT: PharmacyStatusTextMap = {
  PENDING: '대기',
  ACTIVE: '활성',
  REJECTED: '반려',
} as const;

export const ADMIN_DEPARTMENT_OPTIONS = [
  { value: '운영팀' as AdminDepartment, label: '운영팀' },
  { value: '총무팀' as AdminDepartment, label: '총무팀' },
] as const;

export const ADMIN_DEPARTMENT_TEXT: AdminDepartmentTextMap = {
  운영팀: '운영팀',
  총무팀: '총무팀',
} as const;
