import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import instance from '../api/api';
import type { Admin } from '../types/admin';
import type { User } from '../types/auth';
import type { Pharmacy } from '../types/pharmacy';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Admin | Pharmacy | null;
  accessToken: string | null;

  login: (email: string, password: string, role: 'BRANCH' | 'ADMIN') => Promise<void>;
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

      login: async (email, password, role) => {
        try {
          const endpoint = role === 'BRANCH' ? '/auth/login' : '/auth/admin/login';
          const res = await instance.post(endpoint, { email, password });
          // LOG: 테스트용 로그
          console.log('🧪 로그인 응답:', res.data);
          if (res.data.success) {
            const { user, profile, accessToken } = res.data.data;
            set({ isAuthenticated: true, user, profile, accessToken });
            localStorage.setItem('accessToken', accessToken);
          }
        } catch (e: any) {
          console.error('로그인 실패:', e);
          throw new Error(e.response?.data?.message || '로그인 중 오류가 발생했습니다.');
        }
      },

      logout: async () => {
        try {
          const res = await instance.post('/auth/logout', {});
          // LOG: 테스트용 로그
          console.log('🧪 로그아웃 응답:', res.data.data);
          if (res.data.success) {
            set({ isAuthenticated: false, user: null, profile: null, accessToken: null });
            localStorage.removeItem('accessToken');
          }
        } catch (e: any) {
          console.error('로그아웃 실패:', e);
          throw new Error(e.response?.data?.message || '로그아웃 중 오류가 발생했습니다.');
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
