import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mockAdmins, mockPharmacies, mockUsers } from '../mocks/auth.mock';
import type { Admin, Pharmacy, User } from '../mocks/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  profile: Admin | Pharmacy | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      profile: null,

      login: async (email, password) => {
        const foundUser = mockUsers.find(
          (user) => user.email === email && user.password === password,
        );
        if (foundUser) {
          let profile = null;
          if (foundUser.role === 'ADMIN') {
            profile = mockAdmins.find((admin) => admin.userId === foundUser.id) || null;
          } else if (foundUser.role === 'BRANCH') {
            profile = mockPharmacies.find((pharmacy) => pharmacy.userId === foundUser.id) || null;
          }
          set({
            user: foundUser,
            token: `token-${foundUser.id}`, // 임의의 토큰 생성
            isAuthenticated: true,
            profile: profile,
          });
        } else {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          profile: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
