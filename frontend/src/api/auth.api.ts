import { AUTH_ENDPOINT } from '../constants';
import type {
  AdminSignupRequest,
  BranchSignupRequest,
  LoginRequest,
  LoginResponse,
  PasswordChangeRequest,
  SignupResponse,
} from '../types';
import { instance } from './client';

// 가맹점 회원가입
export const branchSignup = async (data: BranchSignupRequest): Promise<SignupResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.BRANCH_SIGNUP, data);
  console.log('🔐 가맹점 회원가입 응답:', response);
  return response.data;
};

// 본사 회원가입
export const adminSignup = async (data: AdminSignupRequest): Promise<SignupResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.ADMIN_SIGNUP, data);
  console.log('🔐 본사 회원가입 응답:', response);
  return response.data;
};

// 가맹점 로그인
export const branchLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.BRANCH_LOGIN, data);
  console.log('🔐 가맹점 로그인 응답:', response);
  return response.data;
};

// 본사 로그인
export const adminLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await instance.post(AUTH_ENDPOINT.ADMIN_LOGIN, data);
  console.log('🔐 본사 로그인 응답:', response);
  return response.data;
};

// 비밀번호 변경
export const changePassword = async (data: PasswordChangeRequest) => {
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
