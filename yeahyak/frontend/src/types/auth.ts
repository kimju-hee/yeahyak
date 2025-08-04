export interface User {
  id: number;
  email: string;
  balance?: number;
  role: 'BRANCH' | 'HQ';
}

export type Role = 'BRANCH' | 'HQ';

export const Roles: Role[] = ['BRANCH', 'HQ'];
