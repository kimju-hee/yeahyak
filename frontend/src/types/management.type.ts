import type { ApiResponse, PaginatedResponse } from './api.type';
import type { Pharmacy, UserCreditStatus } from './profile.type';

export interface BranchRequest {
  request: {
    id: number;
    pharmacyId: number;
    requestedAt: string;
    status: BranchRequestStatus;
    reviewedAt?: string;
  };
  pharmacy: Pharmacy;
}

export const BRANCH_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
} as const;
export type BranchRequestStatus = keyof typeof BRANCH_REQUEST_STATUS;
export type BranchRequestStatusColorMap = { [key in BranchRequestStatus]: string };
export type BranchRequestStatusTextMap = { [key in BranchRequestStatus]: string };

export interface BranchRequestListParams {
  page?: number;
  size?: number;
}

export type BranchRequestListResponse = PaginatedResponse<BranchRequest>;
export type BranchApproveResponse = ApiResponse<string>;
export type BranchRejectResponse = ApiResponse<string>;

export interface PendingCredit {
  userId: number; // 유저코드
  email: string; // 계정(이메일)
  pharmacyId: number; // 지점코드 (추가)
  pharmacyName: string; // 지점명
  point: number; // 미수잔액
  recentSettledDate?: string; // 최근정산일 (추가)
  recentSettledAmount?: number; // 최근정산액 (추가)
  totalSettledAmount?: number; // 누적정산금액 (추가)
  creditStatus: UserCreditStatus; // 상태
}

export type PendingCreditListResponse = PaginatedResponse<PendingCredit>;

export interface PendingCreditListParams {
  page?: number;
  size?: number;
}

export interface SettlementResult {
  userId: number;
  beforePoint: number;
  settledAmount: number;
  afterPoint: number;
  creditStatus: UserCreditStatus;
}

export type SettlementResponse = ApiResponse<SettlementResult>;
