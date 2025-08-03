export interface Notice {
  id: number;
  category: 'NOTICE' | 'LAW' | 'EPIDEMIC' | 'NEW_DRUG';
  title: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Category = 'NOTICE' | 'LAW' | 'EPIDEMIC' | 'NEW_DRUG';

export const Categories: Category[] = ['NOTICE', 'LAW', 'EPIDEMIC', 'NEW_DRUG'];
