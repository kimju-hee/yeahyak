import { MANAGEMENT_ENDPOINT } from '../constants';
import type {
  BranchApproveResponse,
  BranchRejectResponse,
  BranchRequestListParams,
  BranchRequestListResponse,
  PendingCreditListParams,
  PendingCreditListResponse,
  SettlementResponse,
} from '../types';
import { instance } from './client';

// 가맹점 승인 요청 목록 조회
export const getBranchRequests = async (
  params?: BranchRequestListParams,
): Promise<BranchRequestListResponse> => {
  const response = await instance.get(MANAGEMENT_ENDPOINT.REQUESTS, { params });
  console.log('📋 가맹점 승인 요청 목록 조회 응답:', response);
  return response.data;
};

// 가맹점 승인
export const approveBranch = async (pharmacyId: number): Promise<BranchApproveResponse> => {
  const response = await instance.post(MANAGEMENT_ENDPOINT.APPROVE(pharmacyId));
  console.log('📋 가맹점 승인 응답:', response);
  return response.data;
};

// 가맹점 거절
export const rejectBranch = async (pharmacyId: number): Promise<BranchRejectResponse> => {
  const response = await instance.post(MANAGEMENT_ENDPOINT.REJECT(pharmacyId));
  console.log('📋 가맹점 거절 응답:', response);
  return response.data;
};

// 정산 대기 목록 조회
export const getPendingCredits = async (
  params?: PendingCreditListParams,
): Promise<PendingCreditListResponse> => {
  const response = await instance.get(MANAGEMENT_ENDPOINT.PENDINGS, { params });
  console.log('💸 정산 대기 목록 조회 응답:', response);
  return response.data;
};

// 정산 처리
export const processSettlement = async (userId: number): Promise<SettlementResponse> => {
  const response = await instance.post(MANAGEMENT_ENDPOINT.SETTLEMENT(userId));
  console.log('💸 정산 처리 응답:', response);
  return response.data;
};
