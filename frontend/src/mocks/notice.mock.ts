import type { EpidemicSummary, LawSummary, Notice } from './types';

export const mockNotices: Notice[] = [
  {
    id: 1,
    category: 'EPIDEMIC',
    title: '수족구병 발생 동향 및 대응 요령',
    content: '영유아에게 주로 발생하는 수족구병에 대한 정보와 대응 요령에 대한 내용입니다.',
    attachmentUrl: 'epidemic_hand_foot_mouth.pdf',
    createdAt: '2024-09-20T15:00:00Z',
    updatedAt: undefined,
  },
  {
    id: 2,
    category: 'LAW',
    title: '약가 관리 제도 변경 사항',
    content: '새로운 약가 책정 기준 및 관리 제도에 대한 내용입니다.',
    attachmentUrl: 'law_drug_pricing.pdf',
    createdAt: '2024-10-15T11:00:00Z',
    updatedAt: undefined,
  },
  {
    id: 3,
    category: 'LAW',
    title: '마약류 관리법 시행령 일부 개정',
    content: '마약류 관리에 관한 법률 시행령 개정 사항에 대한 내용입니다.',
    attachmentUrl: 'law_narcotics_202503.pdf',
    createdAt: '2025-03-01T13:00:00Z',
    updatedAt: undefined,
  },
  {
    id: 4,
    category: 'NOTICE',
    title: '여름철 의약품 보관 유의사항',
    content: '고온다습한 여름철 의약품 변질 방지를 위한 보관 방법을 안내합니다.',
    attachmentUrl: undefined,
    createdAt: '2025-05-15T16:00:00Z',
    updatedAt: '2025-05-17T14:20:00Z',
  },
  {
    id: 5,
    category: 'EPIDEMIC',
    title: '계절성 독감 유행 현황 및 예방수칙',
    content: '질병관리청 발표 최신 독감 유행 정보 및 예방 수칙에 대한 내용입니다.',
    attachmentUrl: 'epidemic_flu.pdf',
    createdAt: '2025-06-25T11:00:00Z',
    updatedAt: undefined,
  },
  {
    id: 6,
    category: 'NOTICE',
    title: '시스템 점검 안내 (2025년 8월 1일)',
    content: '보다 안정적인 서비스 제공을 위해 시스템 정기 점검이 있을 예정입니다.',
    attachmentUrl: undefined,
    createdAt: '2025-07-29T11:00:00Z',
    updatedAt: undefined,
  },
];

export const mockLawSummaries: LawSummary[] = [
  {
    id: 1,
    title: '약가 관리 제도 변경 사항 요약본',
    content: '새로운 약가 책정 기준 및 관리 제도에 대한 요약본입니다.',
    attachmentUrl: 'law_drug_pricing.pdf',
    createdAt: '2024-10-15T10:59:00Z',
  },
  {
    id: 2,
    title: '마약류 관리법 시행령 일부 개정 요약본',
    content: '마약류 관리에 관한 법률 시행령 개정 사항에 대한 요약본입니다.',
    attachmentUrl: 'law_narcotics_202503.pdf',
    createdAt: '2025-03-01T12:59:00Z',
  },
];

export const mockEpidemicSummaries: EpidemicSummary[] = [
  {
    id: 1,
    title: '수족구병 발생 동향 및 대응 요령 요약본',
    content: '영유아에게 주로 발생하는 수족구병에 대한 정보와 대응 요령에 대한 요약본입니다.',
    attachmentUrl: 'epidemic_hand_foot_mouth.pdf',
    createdAt: '2024-09-20T14:59:00Z',
  },
  {
    id: 2,
    title: '계절성 독감 유행 현황 및 예방수칙 요약본',
    content: '질병관리청 발표 최신 독감 유행 정보 및 예방 수칙에 대한 요약본입니다.',
    attachmentUrl: 'epidemic_flu.pdf',
    createdAt: '2025-06-25T10:59:00Z',
  },
];
