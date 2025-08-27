import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Admin, AdminLoginRes, Pharmacy, PharmacyLoginRes, User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Admin | Pharmacy | null;

  setAuth: (data: PharmacyLoginRes | AdminLoginRes) => void;
  clearAuth: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  updateProfile: (updatedFields: Partial<Admin> | Partial<Pharmacy>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      profile: null,

      setAuth: (data) => {
        const { user, profile, accessToken } = data;
        set({ isAuthenticated: true, user, profile });
        localStorage.setItem('accessToken', accessToken);
      },

      clearAuth: () => {
        set({ isAuthenticated: false, user: null, profile: null });
        localStorage.removeItem('accessToken');
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
