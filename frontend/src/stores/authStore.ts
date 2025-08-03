import { create } from 'zustand';
import instance from '../api/api';
import type { Admin } from '../types/admin';
import type { User } from '../types/auth';
import type { Pharmacy } from '../types/pharmacy';

// TODO: 로컬 스토리지에 access token 저장

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Admin | Pharmacy | null;

  login: (email: string, password: string, type: 'BRANCH' | 'HQ') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => void;
  updateProfile: (updatedFields: Partial<Admin> | Partial<Pharmacy>) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  user: null,
  profile: null,

  login: async (email, password, type) => {
    try {
      const endpoint = type === 'BRANCH' ? '/auth/login' : '/auth/admin/login';
      const res = await instance.post(endpoint, { email, password });
      // const { user, profile } = res.data;
      // set({ isAuthenticated: true, user, profile });
      console.log('🔥✅ 로그인 응답:', res.data);
      if (type === 'BRANCH') {
        set({
          isAuthenticated: true,
          user: {
            id: 1,
            email: 'branch1@test.com',
            role: 'BRANCH',
          },
          profile: {
            id: 1,
            userId: 1,
            pharmacyName: '현정약국',
            bizRegNo: '111-11-11111',
            representativeName: '송현정',
            postcode: '11111',
            address: '부산 해운대구 우동 111-11',
            detailAddress: '101호',
            contact: '051-111-1111',
            status: 'PENDING',
          } as Pharmacy,
        });
      } else {
        set({
          isAuthenticated: true,
          user: {
            id: 2,
            email: 'hq1@test.com',
            role: 'HQ',
          },
          profile: {
            id: 1,
            userId: 2,
            adminName: '송현정',
            department: '운영팀',
          } as Admin,
        });
      }
    } catch (e: any) {
      console.error('로그인 실패:', e);
      throw new Error(e.response?.data?.message || '로그인 중 오류가 발생했습니다.');
    }
  },

  logout: async () => {
    await instance.post('/auth/logout', {});
    set({ isAuthenticated: false, user: null, profile: null });
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
}));
