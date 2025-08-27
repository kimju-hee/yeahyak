import { RETURN_ENDPOINT } from '../constants';
import type {
  ReturnCreateReq,
  ReturnCreateResponse,
  ReturnDetailResponse,
  ReturnListBranchParams,
  ReturnListHqParams,
  ReturnListResponse,
  ReturnUpdateReq,
} from '../types';
import { instance } from './client';

// 반품 생성
export const createReturn = async (data: ReturnCreateReq): Promise<ReturnCreateResponse> => {
  const response = await instance.post(RETURN_ENDPOINT.CREATE, data);
  console.log('↩️ 반품 생성 응답:', response);
  return response.data;
};

// 반품 상태 업데이트
export const updateReturn = async (returnId: number, data: ReturnUpdateReq) => {
  const response = await instance.patch(RETURN_ENDPOINT.UPDATE(returnId), data);
  console.log('↩️ 반품 상태 업데이트 응답:', response);
  return response.data;
};

// 반품 상세 조회
export const getReturn = async (returnId: number): Promise<ReturnDetailResponse> => {
  const response = await instance.get(RETURN_ENDPOINT.DETAIL(returnId));
  console.log('↩️ 본사 반품 상세 조회 응답:', response);
  return response.data;
};

// 반품 삭제
export const deleteReturn = async (returnId: number) => {
  const response = await instance.delete(RETURN_ENDPOINT.DELETE(returnId));
  console.log('↩️ 반품 삭제 응답:', response);
  return response.data;
};

// 본사에서 반품 목록 조회
export const getReturnsHq = async (params?: ReturnListHqParams): Promise<ReturnListResponse> => {
  const response = await instance.get(RETURN_ENDPOINT.LIST_HQ, { params });
  console.log('↩️ 본사 반품 목록 조회 응답:', response);
  return response.data;
};

// 가맹점에서 반품 목록 조회
export const getReturnsBranch = async (
  params: ReturnListBranchParams,
): Promise<ReturnListResponse> => {
  const response = await instance.get(RETURN_ENDPOINT.LIST_BRANCH, { params });
  console.log('↩️ 가맹점 반품 목록 조회 응답:', response);
  return response.data;
};
