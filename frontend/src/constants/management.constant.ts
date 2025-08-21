import type {
  BranchRequestStatus,
  BranchRequestStatusColorMap,
  BranchRequestStatusTextMap,
} from '../types';

export const MANAGEMENT_ENDPOINT = {
  // 가맹점 관리
  REQUESTS: '/admin/pharmacies/requests',
  APPROVE: (pharmacyId: number) => `/admin/pharmacies/${pharmacyId}/approve`,
  REJECT: (pharmacyId: number) => `/admin/pharmacies/${pharmacyId}/reject`,
  // 정산 관리
  PENDINGS: '/credit/pending',
  SETTLEMENT: (userId: number) => `/credit/approve/${userId}`,
} as const;

export const BRANCH_REQUEST_STATUS_OPTIONS = [
  { value: 'PENDING' as BranchRequestStatus, label: '대기' },
  { value: 'ACTIVE' as BranchRequestStatus, label: '활성' },
  { value: 'REJECTED' as BranchRequestStatus, label: '반려' },
] as const;

export const BRANCH_REQUEST_STATUS_COLORS: BranchRequestStatusColorMap = {
  PENDING: 'warning',
  ACTIVE: 'success',
  REJECTED: 'default',
} as const;

export const BRANCH_REQUEST_STATUS_TEXT: BranchRequestStatusTextMap = {
  PENDING: '대기',
  ACTIVE: '활성',
  REJECTED: '반려',
} as const;

export const CREDIT_CONSTANTS = {
  CREDIT_LIMIT: 10000000,
  MIN_POINT: -10000000,
  INITIAL_POINT: 0,
} as const;
