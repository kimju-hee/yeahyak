export interface Admin {
  adminId: number;
  userId: number;
  adminName: string;
  department: '운영팀' | '총무팀';
}

export type Department = '운영팀' | '총무팀';

export const DEPARTMENTS: Department[] = ['운영팀', '총무팀'];
