export interface User {
  userId: number;
  email: string;
  point?: number;
  role: 'BRANCH' | 'ADMIN';
}

export type Role = 'BRANCH' | 'ADMIN';

export const ROLES: Role[] = ['BRANCH', 'ADMIN'];
