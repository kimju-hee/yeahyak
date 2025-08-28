import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Admin, AdminLogin, Pharmacy, PharmacyLogin, User } from '../types';
import { useOrderCartStore } from './orderCartStore';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Admin | Pharmacy | null;

  setAuth: (data: PharmacyLogin | AdminLogin) => void;
  clearAuth: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  updateProfile: (updatedFields: Partial<Admin> | Partial<Pharmacy>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get, api) => ({
      isAuthenticated: false,
      user: null,
      profile: null,

      setAuth: (data) => {
        const { accessToken, user, profile } = data;
        localStorage.setItem('accessToken', accessToken);
        set({ isAuthenticated: true, user, profile });
      },

      clearAuth: () => {
        // 인증 상태 초기화
        set({ isAuthenticated: false, user: null, profile: null });
        localStorage.removeItem('accessToken');
        api.persist.clearStorage();

        // 발주 카트 데이터도 함께 초기화
        useOrderCartStore.getState().clearCart();
        useOrderCartStore.persist.clearStorage();

        // 쿠키의 refresh token은 서버에서 로그아웃 API 호출 시 삭제됨
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
