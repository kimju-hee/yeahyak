import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mockUsers } from '../mocks/auth.mock';
import type { User } from '../mocks/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const foundUser = mockUsers.find(
          (user) => user.email === email && user.password === password,
        );
        if (foundUser) {
          set({
            user: foundUser,
            token: `token-${foundUser.id}`, // 임의의 토큰 생성
            isAuthenticated: true,
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
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
