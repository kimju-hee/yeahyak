import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { instance } from '../api/api';
import type { LoginRequest } from '../types/auth.type';
import {
  PHARMACY_STATUS,
  USER_ROLE,
  type Admin,
  type Pharmacy,
  type User,
  type UserRole,
} from '../types/profile.type';

export interface LoginPayload extends LoginRequest {
  role: UserRole;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Admin | Pharmacy | null;
  accessToken: string | null;

  login: ({ email, password, role }: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => void;
  updateProfile: (updatedFields: Partial<Admin> | Partial<Pharmacy>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      profile: null,
      accessToken: null,

      login: async ({ email, password, role }) => {
        try {
          const endpoint = role === USER_ROLE.BRANCH ? '/auth/login' : '/auth/admin/login';
          const res = await instance.post(endpoint, { email, password });
          // LOG: 테스트용 로그
          console.log('🧪 로그인 응답:', res.data);
          if (res.data.success) {
            const { user, profile, accessToken } = res.data.data;

            if (role === USER_ROLE.BRANCH) {
              if (profile.status === PHARMACY_STATUS.PENDING) {
                throw new Error('승인 대기 중인 계정입니다. 관리자에게 문의하세요.');
              }
              if (profile.status === PHARMACY_STATUS.REJECTED) {
                throw new Error('승인 거절된 계정입니다. 관리자에게 문의하세요.');
              }
            }

            set({ isAuthenticated: true, user, profile, accessToken });
            localStorage.setItem('accessToken', accessToken);
          }
        } catch (e: any) {
          console.error('로그인 실패:', e);
          throw new Error(e.message || '로그인 중 오류가 발생했습니다.');
        }
      },

      logout: async () => {
        try {
          const res = await instance.post('/auth/logout', {});
          // LOG: 테스트용 로그
          console.log('🧪 로그아웃 응답:', res.data);
        } catch (e: any) {
          console.error('로그아웃 실패:', e);
          throw new Error(e.response?.data?.message || '로그아웃 중 오류가 발생했습니다.');
        } finally {
          set({ isAuthenticated: false, user: null, profile: null, accessToken: null });
          localStorage.removeItem('accessToken');
        }
      },

      updateUser: (updatedFields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        }));
      },

      updateProfile: (updatedFields) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updatedFields } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
