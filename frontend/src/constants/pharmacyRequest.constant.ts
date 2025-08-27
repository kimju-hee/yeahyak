import type {
  PharmacyRequestStatus,
  PharmacyRequestStatusColorMap,
  PharmacyRequestStatusTextMap,
} from '../types';

export const PHARMACY_REQUEST_ENDPOINT = {
  LIST: '/pharmacy-requests',
  DETAIL: (pharmacyRequestId: number) => `/pharmacy-requests/${pharmacyRequestId}`,
  APPROVE: (pharmacyRequestId: number) => `/pharmacy-requests/${pharmacyRequestId}/approve`,
  REJECT: (pharmacyRequestId: number) => `/pharmacy-requests/${pharmacyRequestId}/reject`,
} as const;

export const PHARMACY_REQUEST_STATUS_OPTIONS = [
  { value: 'PENDING' as PharmacyRequestStatus, label: '대기' },
  { value: 'APPROVED' as PharmacyRequestStatus, label: '활성' },
  { value: 'REJECTED' as PharmacyRequestStatus, label: '반려' },
] as const;

export const PHARMACY_REQUEST_STATUS_COLORS: PharmacyRequestStatusColorMap = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'default',
} as const;

export const PHARMACY_REQUEST_STATUS_TEXT: PharmacyRequestStatusTextMap = {
  PENDING: '대기',
  APPROVED: '활성',
  REJECTED: '반려',
} as const;
