import type { Rule } from 'antd/es/form';
import { FILE_UPLOAD } from '../constants';

/**
 * 비밀번호 검증 함수
 * 영문, 숫자, 특수문자 중 3종류 이상 조합하여 8자리 이상
 */
export const validatePassword = (value: string): boolean => {
  if (!value) return false;

  const length = value.length;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  const typeCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  return typeCount >= 3 && length >= 8;
};

/**
 * 비밀번호 검증 규칙
 */
export const passwordValidationRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();

    if (validatePassword(value)) {
      return Promise.resolve();
    }

    return Promise.reject(
      new Error('영문, 숫자, 특수문자를 조합하여 8자리 이상으로 입력해주세요.'),
    );
  },
};

/**
 * 비밀번호가 아이디(이메일)와 같지 않게 하는 검증 규칙
 * @param getFieldValue Form의 getFieldValue 함수
 * @param emailFieldName 아이디(이메일) 필드명
 */
export const passwordNotSameAsIdRule = (
  getFieldValue: (name: string) => any,
  emailFieldName: string = 'email',
): Rule => ({
  validator: (_, value) => {
    const emailValue = getFieldValue(emailFieldName);
    if (!value || !emailValue || value !== emailValue) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('비밀번호는 아이디와 같을 수 없습니다.'));
  },
});

/**
 * 새 비밀번호가 기존 비밀번호와 같지 않게 하는 검증 규칙
 * @param getFieldValue Form의 getFieldValue 함수
 * @param currentPasswordFieldName 기존 비밀번호 필드명
 */
export const passwordNotSameAsCurrentRule = (
  getFieldValue: (name: string) => any,
  currentPasswordFieldName: string = 'currentPassword',
): Rule => ({
  validator: (_, value) => {
    const currentPassword = getFieldValue(currentPasswordFieldName);
    if (!value || !currentPassword || value !== currentPassword) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('새 비밀번호는 기존 비밀번호와 같을 수 없습니다.'));
  },
});

/**
 * 비밀번호 확인 검증 규칙
 * @param getFieldValue Form의 getFieldValue 함수
 * @param passwordFieldName 비교할 비밀번호 필드명
 */
export const passwordConfirmRule = (
  getFieldValue: (name: string) => any,
  passwordFieldName: string = 'password',
): Rule => ({
  validator: (_, value) => {
    if (!value || getFieldValue(passwordFieldName) === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
  },
});

/**
 * 파일 크기 검증 함수
 * @param file 검증할 파일
 * @param maxSizeBytes 최대 파일 크기 (bytes)
 */
export const validateFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

/**
 * 파일 확장자 검증 함수
 * @param file 검증할 파일
 * @param allowedExtensions 허용된 확장자 배열
 */
export const validateFileExtension = (
  file: File,
  allowedExtensions: readonly string[],
): boolean => {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedExtensions.includes(fileExtension as any);
};

/**
 * 공지사항 파일 검증 함수
 * @param file 검증할 파일
 * @param announcementType 공지사항 타입
 */
export const validateAttachmentFile = (file: File, announcementType: string): string | null => {
  // 파일 크기 검증
  if (!validateFileSize(file, FILE_UPLOAD.MAX_SIZE_BYTES)) {
    return `파일 크기는 ${FILE_UPLOAD.MAX_SIZE_MB}MB 이하여야 합니다.`;
  }

  // 확장자 검증
  switch (announcementType) {
    case 'LAW':
      if (!validateFileExtension(file, FILE_UPLOAD.ALLOWED_EXTENSIONS.LAW)) {
        return '법령 카테고리는 .txt 파일만 지원합니다.';
      }
      break;
    case 'EPIDEMIC':
      if (!validateFileExtension(file, FILE_UPLOAD.ALLOWED_EXTENSIONS.EPIDEMIC)) {
        return '감염병 카테고리는 .pdf 파일만 지원합니다.';
      }
      break;
    case 'NEW_PRODUCT':
      if (!validateFileExtension(file, FILE_UPLOAD.ALLOWED_EXTENSIONS.NEW_PRODUCT)) {
        return '신제품 카테고리는 .pdf 파일만 지원합니다.';
      }
      break;
    default:
      return null;
  }

  return null;
};
