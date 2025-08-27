import { AUTH_ENDPOINT } from '../constants';
import type {
  AdminSignupReq,
  AdminUpdateReq,
  LoginReq,
  LoginResponse,
  PasswordChangeReq,
  PharmacySignupReq,
  PharmacyUpdateReq,
  SignupResponse,
} from '../types';
import { instance } from './client';

// 관리자 회원가입
export const adminSignup = async (data: AdminSignupReq): Promise<SignupResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.ADMIN_SIGNUP, data);
  console.log('🔐 관리자 회원가입 응답:', response);
  return response.data;
};

// 약국 회원가입
export const pharmacySignup = async (data: PharmacySignupReq): Promise<SignupResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.PHARMACY_SIGNUP, data);
  console.log('🔐 약국 회원가입 응답:', response);
  return response.data;
};

// 관리자 로그인
export const adminLogin = async (data: LoginReq): Promise<LoginResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.ADMIN_LOGIN, data);
  console.log('🔐 관리자 로그인 응답:', response);
  return response.data;
};

// 약국 로그인
export const pharmacyLogin = async (data: LoginReq): Promise<LoginResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.PHARMACY_LOGIN, data);
  console.log('🔐 약국 로그인 응답:', response);
  return response.data;
};

// 비밀번호 변경
export const changePassword = async (data: PasswordChangeReq) => {
  const response = await instance.put(AUTH_ENDPOINT.PASSWORD_CHANGE, data);
  console.log('🔐 비밀번호 변경 응답:', response);
  return response.data;
};

// 로그아웃
export const logout = async () => {
  const response = await instance.post(AUTH_ENDPOINT.LOGOUT);
  console.log('🔐 로그아웃 응답:', response);
  return response.data;
};

// 토큰 갱신
export const refreshToken = async () => {
  const response = await instance.post(AUTH_ENDPOINT.REFRESH);
  console.log('🔐 토큰 갱신 응답:', response);
  return response.data;
};

// 관리자 프로필 수정
export const updateAdmin = async (adminId: number, data: AdminUpdateReq) => {
  const response = await instance.put(AUTH_ENDPOINT.ADMIN_UPDATE(adminId), data);
  console.log('✏️ 관리자 프로필 수정 응답:', response);
  return response.data;
};

// 약국 프로필 수정
export const updatePharmacy = async (pharmacyId: number, data: PharmacyUpdateReq) => {
  const response = await instance.put(AUTH_ENDPOINT.PHARMACY_UPDATE(pharmacyId), data);
  console.log('✏️ 약국 프로필 수정 응답:', response);
  return response.data;
};
