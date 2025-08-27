export const FILE_UPLOAD = {
  MAX_SIZE_MB: 30, // 최대 파일 크기 (MB)
  MAX_SIZE_BYTES: 30 * 1024 * 1024, // 최대 파일 크기 (bytes)
  ALLOWED_EXTENSIONS: {
    LAW: ['.txt'],
    EPIDEMIC: ['.pdf'],
    NEW_PRODUCT: ['.pdf'],
  },
  ALLOWED_MIME_TYPES: {
    LAW: ['text/plain'],
    EPIDEMIC: ['application/pdf'],
    NEW_PRODUCT: ['application/pdf'],
  },
} as const;

export const DATE_FORMAT = {
  DEFAULT: 'YYYY. MM. DD. HH:mm',
  DATE: 'YYYY. MM. DD.',
  TIME: 'HH:mm',
  KR_DEFAULT: 'YYYY년 MM월 DD일 HH시 mm분',
  KR_DATE: 'YYYY년 MM월 DD일',
  KR_TIME: 'HH시 mm분',
} as const;

export const PAGE_SIZE = 10; // 페이지당 항목 수
export const PRODUCT_PAGE_SIZE = 12; // 페이지당 항목 수

export const REGION_CASCADER_OPTIONS = [
  {
    value: '수도권',
    label: '수도권',
    children: [
      { value: '서울', label: '서울' },
      { value: '인천', label: '인천' },
      { value: '경기', label: '경기' },
    ],
  },
  { value: '강원특별자치도', label: '강원특별자치도' },
  {
    value: '충청',
    label: '충청',
    children: [
      { value: '대전', label: '대전' },
      { value: '세종특별자치시', label: '세종특별자치시' },
      { value: '충북', label: '충북' },
      { value: '충남', label: '충남' },
    ],
  },
  {
    value: '영남',
    label: '영남',
    children: [
      { value: '부산', label: '부산' },
      { value: '대구', label: '대구' },
      { value: '울산', label: '울산' },
      { value: '경북', label: '경북' },
      { value: '경남', label: '경남' },
    ],
  },
  {
    value: '호남',
    label: '호남',
    children: [
      { value: '광주', label: '광주' },
      { value: '전북특별자치도', label: '전북특별자치도' },
      { value: '전남', label: '전남' },
    ],
  },
  { value: '제주특별자치도', label: '제주특별자치도' },
];
