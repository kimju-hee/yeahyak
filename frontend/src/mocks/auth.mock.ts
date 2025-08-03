import type { User } from '../types/auth';

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin1@test.com',
    balance: undefined,
    role: 'HQ',
  },
  {
    id: 2,
    email: 'branch1@test.com',
    balance: 341000,
    role: 'BRANCH',
  },
  {
    id: 3,
    email: 'branch2@test.com',
    balance: -1247800,
    role: 'BRANCH',
  },
  {
    id: 4,
    email: 'admin2@test.com',
    balance: undefined,
    role: 'HQ',
  },
  {
    id: 5,
    email: 'branch3@test.com',
    balance: 698900,
    role: 'HQ',
  },
  {
    id: 6,
    email: 'branch4@test.com',
    balance: -671800,
    role: 'BRANCH',
  },
  {
    id: 7,
    email: 'branch5@test.com',
    balance: 0,
    role: 'BRANCH',
  },
  {
    id: 8,
    email: 'branch6@test.com',
    balance: 0,
    role: 'BRANCH',
  },
];
