import { RETURN_ENDPOINT } from '../constants';
import type {
  ReturnApproveResponse,
  ReturnCreateRequest,
  ReturnCreateResponse,
  ReturnDeleteResponse,
  ReturnDetailResponse,
  ReturnListAdminParams,
  ReturnListBranchParams,
  ReturnListResponse,
  ReturnRejectResponse,
  ReturnStatusUpdateRequest,
  ReturnStatusUpdateResponse,
} from '../types';
import { instance } from './client';

// 반품 생성
export const createReturn = async (data: ReturnCreateRequest): Promise<ReturnCreateResponse> => {
  const response = await instance.post(RETURN_ENDPOINT.CREATE, data);
  console.log('↩️ 반품 생성 응답:', response);
  return response.data;
};

// 가맹점에서 반품 목록 조회
export const getBranchReturns = async (
  params: ReturnListBranchParams,
): Promise<ReturnListResponse> => {
  const response = await instance.get(RETURN_ENDPOINT.LIST_BRANCH, { params });
  console.log('↩️ 가맹점 반품 목록 조회 응답:', response);
  return response.data;
};

// 본사에서 반품 목록 조회
export const getAdminReturns = async (
  params?: ReturnListAdminParams,
): Promise<ReturnListResponse> => {
  const response = await instance.get(RETURN_ENDPOINT.LIST_ADMIN, { params });
  console.log('↩️ 본사 반품 목록 조회 응답:', response);
  return response.data;
};

// 가맹점에서 반품 상세 조회
export const getBranchReturn = async (returnId: number): Promise<ReturnDetailResponse> => {
  const response = await instance.get(RETURN_ENDPOINT.DETAIL_BRANCH(returnId));
  console.log('↩️ 가맹점 반품 상세 조회 응답:', response);
  return response.data;
};

// 본사에서 반품 상세 조회
export const getAdminReturn = async (returnId: number): Promise<ReturnDetailResponse> => {
  const response = await instance.get(RETURN_ENDPOINT.DETAIL_ADMIN(returnId));
  console.log('↩️ 본사 반품 상세 조회 응답:', response);
  return response.data;
};

// 반품 승인
export const approveReturn = async (returnId: number): Promise<ReturnApproveResponse> => {
  const response = await instance.post(RETURN_ENDPOINT.APPROVE(returnId));
  console.log('↩️ 반품 승인 응답:', response);
  return response.data;
};

// 반품 거절
export const rejectReturn = async (returnId: number): Promise<ReturnRejectResponse> => {
  const response = await instance.post(RETURN_ENDPOINT.REJECT(returnId));
  console.log('↩️ 반품 거절 응답:', response);
  return response.data;
};

// 반품 상태 업데이트
export const updateReturnStatus = async (
  returnId: number,
  data: ReturnStatusUpdateRequest,
): Promise<ReturnStatusUpdateResponse> => {
  const response = await instance.patch(RETURN_ENDPOINT.UPDATE_STATUS(returnId), data);
  console.log('↩️ 반품 상태 업데이트 응답:', response);
  return response.data;
};

// 반품 삭제
export const deleteReturn = async (returnId: number): Promise<ReturnDeleteResponse> => {
  const response = await instance.delete(RETURN_ENDPOINT.DELETE(returnId));
  console.log('↩️ 반품 삭제 응답:', response);
  return response.data;
};
