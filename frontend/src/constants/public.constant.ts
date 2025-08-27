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
