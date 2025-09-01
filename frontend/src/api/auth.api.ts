import { AUTH_ENDPOINT } from '../constants';
import type {
  AdminSignupRequest,
  AdminUpdateRequest,
  AdminUpdateResponse,
  LoginRequest,
  LoginResponse,
  PasswordChangeRequest,
  PharmacySignupRequest,
  PharmacyUpdateRequest,
  PharmacyUpdateResponse,
  SignupResponse,
} from '../types';
import { instance } from './client';

// 관리자 회원가입
export const adminSignup = async (data: AdminSignupRequest): Promise<SignupResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.SIGNUP_HQ, data);

  console.log('🔐 관리자 회원가입 응답:', response);
  return response.data;
};

// 약국 회원가입
export const pharmacySignup = async (data: PharmacySignupRequest): Promise<SignupResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.SIGNUP_BRANCH, data);

  console.log('🔐 약국 회원가입 응답:', response);
  return response.data;
};

// 관리자 로그인
export const adminLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.LOGIN_HQ, data);

  console.log('🔐 관리자 로그인 응답:', response);
  return response.data;
};

// 약국 로그인
export const pharmacyLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.LOGIN_BRANCH, data);

  console.log('🔐 약국 로그인 응답:', response);
  return response.data;
};

// 비밀번호 변경
export const changePassword = async (data: PasswordChangeRequest): Promise<void> => {
  const response = await instance.post(AUTH_ENDPOINT.PASSWORD_CHANGE, data);

  console.log('🔐 비밀번호 변경 응답:', response);
};

// 로그아웃
export const logout = async (): Promise<void> => {
  const response = await instance.post(AUTH_ENDPOINT.LOGOUT);

  console.log('🔐 로그아웃 응답:', response);
};

// 관리자 프로필 수정
export const adminUpdate = async (
  adminId: number,
  data: AdminUpdateRequest,
): Promise<AdminUpdateResponse> => {
  const response = await instance.patch(AUTH_ENDPOINT.UPDATE_HQ(adminId), data);

  console.log('✏️ 관리자 프로필 수정 응답:', response);
  return response.data;
};

// 약국 프로필 수정
export const pharmacyUpdate = async (
  pharmacyId: number,
  data: PharmacyUpdateRequest,
): Promise<PharmacyUpdateResponse> => {
  const response = await instance.patch(AUTH_ENDPOINT.UPDATE_BRANCH(pharmacyId), data);

  console.log('✏️ 약국 프로필 수정 응답:', response);
  return response.data;
};
