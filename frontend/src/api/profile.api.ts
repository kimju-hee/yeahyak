import { PROFILE_ENDPOINT } from '../constants';
import type {
  AdminProfileUpdateRequest,
  AdminProfileUpdateResponse,
  BranchProfileUpdateRequest,
  BranchProfileUpdateResponse,
} from '../types';
import { instance } from './client';

// 가맹점 프로필 수정
export const updateBranchProfile = async (
  data: BranchProfileUpdateRequest,
): Promise<BranchProfileUpdateResponse> => {
  const response = await instance.put(PROFILE_ENDPOINT.BRANCH_UPDATE(data.pharmacyId), data);
  console.log('✏️ 가맹점 프로필 수정 응답:', response);
  return response.data;
};

// 관리자 프로필 수정
export const updateAdminProfile = async (
  data: AdminProfileUpdateRequest,
): Promise<AdminProfileUpdateResponse> => {
  const response = await instance.put(PROFILE_ENDPOINT.ADMIN_UPDATE(data.adminId), data);
  console.log('✏️ 관리자 프로필 수정 응답:', response);
  return response.data;
};
