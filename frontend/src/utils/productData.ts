// src/utils/productData.ts

export type MedicineDetail = {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  category: string;      // 예: 내복제
  image: string;
  rxType: '전문의약품' | '일반의약품';
  mfdsClass: string;     // 식약처 분류
  unit: string;          // 수량 단위
  registeredAt: string;  // YYYY-MM-DD
  details: Record<string, string>; // 상세 섹션별 내용
};

export type SupplyDetail = {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  category: string;      // 예: 주사용품/주사기/주사침
  image: string;
  unit: string;          // 수량 단위 (박스/팩/EA 등)
  registeredAt: string;  // YYYY-MM-DD
};

// -------------------- 의약품 --------------------
export const productDetails: Record<string, MedicineDetail> = {
  '1': {
    id: '1',
    name: '속엔쿨정',
    manufacturer: 'GC녹십자',
    price: 10000,
    category: '내복제',
    image: '/images/SoknCool.jpg',
    rxType: '일반의약품',
    mfdsClass: '제산제(소화성궤양용제)',
    unit: '정',
    registeredAt: '2025-07-10',
    details: {
      외형정보: [
        '· 성상 : 장방형의 장용피를 한 흰색필름코팅정',
        '· 제형 : 필름코팅정',
        '· 모양 : 장방형',
        '· 색상 : 하양',
        '· 식별표기 : PR',
      ].join('\n'),
      성분정보:
        '디메티콘 25mg, 우담즙엑스 25mg, 판크레아틴 175mg, 헤미셀룰라제 50mg',
      저장방법: '실온보관, 밀폐용기',
      효능효과:
        '소화불량, 식욕감퇴(식욕부진), 과식, 체함, 소화촉진, 소화불량으로 인한 위부팽만감',
      용법용량: '성인 1회 2정, 1일 3회 식후에 복용한다.',
      사용상주의사항: [
        '1. 다음과 같은 사람은 이 약을 복용하지 말 것.',
        '  1) 만 7세 이하의 어린이',
        '  2) 갈락토오스 불내성, Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등',
        '',
        '2. 다음과 같은 사람은 복용 전 의사, 약사와 상담할 것.',
        '  1) 알레르기 체질',
        '  2) 다른 약물 복용 중',
        '',
        '3. 2주 이상 복용해도 증상 개선이 없을 경우 중단 및 상담',
        '4. 복용 시 정해진 용법·용량 준수',
      ].join('\n'),
      저장상의주의사항: [
        '1) 어린이의 손이 닿지 않는 곳에 보관',
        '2) 직사광선·습기 피하고 밀폐 보관',
        '3) 다른 용기에 옮기지 말 것',
      ].join('\n'),
    },
  },

  '2': {
    id: '2',
    name: '에스마린350연질캡슐',
    manufacturer: '대웅제약',
    price: 9200,
    category: '내복제',
    image: '/images/S_marin.png',
    rxType: '일반의약품',
    mfdsClass: '간질환용제(밀크시슬)',
    unit: '캡슐',
    registeredAt: '2025-07-20',
    details: {
      성분정보: '밀크시슬열매건조엑스 350mg',
      효능효과: '간 보호 및 간 기능 개선 보조',
      용법용량: '성인 1회 1캡슐, 1일 2~3회 복용',
      저장방법: '실온보관, 밀폐용기',
    },
  },

  '3': {
    id: '3',
    name: '리어스탑캡슐',
    manufacturer: '한미약품',
    price: 8900,
    category: '내복제',
    image: '/images/lierstop.jpg',
    rxType: '일반의약품',
    mfdsClass: '진경제(위장관운동조절)',
    unit: '캡슐',
    registeredAt: '2025-07-22',
    details: {
      성분정보: '로페라마이드염산염 등',
      효능효과: '설사 증상 완화',
      용법용량: '성인 증상 시 1캡슐, 1일 최대 4캡슐',
      저장방법: '실온보관, 밀폐용기',
    },
  },

  '4': {
    id: '4',
    name: '세미론정',
    manufacturer: '삼진제약',
    price: 8500,
    category: '내복제',
    image: '/images/semiron.jpg',
    rxType: '일반의약품',
    mfdsClass: '소화효소제',
    unit: '정',
    registeredAt: '2025-07-18',
    details: {
      성분정보: '판크레아틴 등 소화효소',
      효능효과: '소화불량, 위부팽만감',
      용법용량: '성인 1회 2정, 1일 3회 식후',
      저장방법: '실온보관',
    },
  },

  '6': {
    id: '6',
    name: '메이킨큐장용정',
    manufacturer: '종근당제약',
    price: 6900,
    category: '내복제',
    image: '/images/Maken_Q.jpg',
    rxType: '일반의약품',
    mfdsClass: '프로바이오틱스제',
    unit: '정',
    registeredAt: '2025-07-05',
    details: {
      성분정보: '유산균 혼합제제',
      효능효과: '장내균총 개선, 설사/변비 보조',
      용법용량: '성인 1회 1정, 1일 2~3회',
      저장방법: '서늘한 곳 보관',
    },
  },

  '7': {
    id: '7',
    name: '훼스탈플러스정',
    manufacturer: '한독',
    price: 7600,
    category: '내복제',
    image: '/images/FestalPlusTablets.jpg',
    rxType: '일반의약품',
    mfdsClass: '소화효소제',
    unit: '정',
    registeredAt: '2025-07-03',
    details: {
      성분정보: '디아스타제, 리파아제 등',
      효능효과: '소화불량, 더부룩함, 복부팽만',
      용법용량: '성인 1회 1~2정, 1일 3회',
      저장방법: '실온보관',
    },
  },

  '8': {
    id: '8',
    name: '까스활명수큐액',
    manufacturer: '동화약품',
    price: 7800,
    category: '내복제',
    image: '/images/Cass_active_water.jpg',
    rxType: '일반의약품',
    mfdsClass: '소화기계용제',
    unit: '병',
    registeredAt: '2025-07-08',
    details: {
      성분정보: '소화액 혼합제제',
      효능효과: '소화불량, 복부팽만, 속쓰림',
      용법용량: '성인 1회 1병',
      저장방법: '실온보관',
    },
  },
  
  '9': {
    id: '4',
    name: '세미론정',
    manufacturer: '삼진제약',
    price: 8500,
    category: '내복제',
    image: '/images/semiron.jpg',
    rxType: '일반의약품',
    mfdsClass: '소화효소제',
    unit: '정',
    registeredAt: '2025-07-18',
    details: {
      성분정보: '판크레아틴 등 소화효소',
      효능효과: '소화불량, 위부팽만감',
      용법용량: '성인 1회 2정, 1일 3회 식후',
      저장방법: '실온보관',
    },
  },
};

// -------------------- 의약 소모품 --------------------
export const supplyDetails: Record<string, SupplyDetail> = {
  '101': {
    id: '101',
    name: '폴리글러브 일회용비닐장갑200매/박스',
    manufacturer: '건강누리',
    price: 2250,
    category: '마스크/모자/장갑',
    image: '/images/폴리글러브.jpg',
    unit: '박스',
    registeredAt: '2025-07-12',
  },
  '102': {
    id: '102',
    name: '부광 일회용주사기 무침 20ml 50개입',
    manufacturer: '부광메디칼',
    price: 6840,
    category: '주사용품/주사기/주사침',
    image: '/images/부광_일회용주사기.jpg',
    unit: '박스',
    registeredAt: '2025-07-09',
  },
  '103': {
    id: '103',
    name: '래피젠 CoviFlu 듀오 진단키트 20T',
    manufacturer: '래피젠',
    price: 153600,
    category: '진단키트',
    image: '/images/래피젠키트.png',
    unit: '키트(20T)',
    registeredAt: '2025-07-14',
  },
  '104': {
    id: '104',
    name: '수성위재_외과패드/써지칼패드(Surgical Pad)',
    manufacturer: '수성위재',
    price: 7680,
    category: '거즈/탈지면/붕대/솜/면봉',
    image: '/images/외과패드.jpg',
    unit: '팩',
    registeredAt: '2025-07-06',
  },
  '105': {
    id: '105',
    name: '퓨로메디 500ml',
    manufacturer: '더가넷',
    price: 12000,
    category: '소독/세척',
    image: '/images/퓨로메디.jpg',
    unit: '병',
    registeredAt: '2025-07-04',
  },
  '106': {
    id: '106',
    name: '외과용각침 10호 53mm 3/8Circle 10개입',
    manufacturer: '아이리',
    price: 7800,
    category: '봉합사/봉합침',
    image: '/images/외과용각침.jpg',
    unit: '팩',
    registeredAt: '2025-07-02',
  },
  '107': {
    id: '107',
    name: '시지바이오_이지덤플러스씬상처습윤밴드(10x10cm)',
    manufacturer: '시지바이오',
    price: 17800,
    category: '반창고/밴드/부직/테이프드레싱',
    image: '/images/이지덤플러스씬.jpg',
    unit: 'EA',
    registeredAt: '2025-07-01',
  },
};
