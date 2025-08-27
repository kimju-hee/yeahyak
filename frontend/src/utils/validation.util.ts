import type { Rule } from 'antd/es/form';
import { FILE_UPLOAD } from '../constants';

/**
 * 📝 비밀번호 검증 함수
 * - 최소 8자 이상
 * - 대문자/소문자/숫자/특수문자 중 3종류 이상 포함
 * @param value - 검증할 비밀번호 문자열
 * @returns boolean - 검증 통과 시 true
 * @example
 * validatePassword('Password123!') // true
 * validatePassword('123456') // false (조건 미충족)
 */
export const validatePassword = (value: string): boolean => {
  if (!value) return false;

  const length = value.length;
  const hasUpper = /[A-Z]/.test(value); // 대문자 포함 여부
  const hasLower = /[a-z]/.test(value); // 소문자 포함 여부
  const hasNumber = /[0-9]/.test(value); // 숫자 포함 여부
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value); // 특수문자 포함 여부

  const typeCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  return typeCount >= 3 && length >= 8;
};

/**
 * 🔒 Ant Design Form용 비밀번호 검증 규칙
 * - 폼 필드에 직접 적용 가능한 검증 규칙
 * @example
 * <Form.Item name="password" rules={[passwordValidationRule]}>
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
 * 🚫 비밀번호-아이디 중복 방지 검증 규칙 생성기
 * - 비밀번호가 이메일(아이디)과 동일하지 않도록 검증
 * @param getFieldValue - Form의 getFieldValue 함수 (다른 필드 값 조회용)
 * @param emailFieldName - 비교할 이메일 필드명 (기본값: 'email')
 * @returns Rule - Ant Design Form 검증 규칙
 * @example
 * const { getFieldValue } = useForm();
 * <Form.Item rules={[passwordNotSameAsIdRule(getFieldValue)]}>
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
 * 🔄 새 비밀번호-기존 비밀번호 중복 방지 검증 규칙 생성기
 * - 새 비밀번호가 현재 비밀번호와 다른지 검증 (비밀번호 변경 시 사용)
 * @param getFieldValue - Form의 getFieldValue 함수
 * @param currentPasswordFieldName - 현재 비밀번호 필드명 (기본값: 'currentPassword')
 * @returns Rule - Ant Design Form 검증 규칙
 * @example
 * <Form.Item name="newPassword" rules={[passwordNotSameAsCurrentRule(getFieldValue)]}>
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
 * ✅ 비밀번호 확인 일치 검증 규칙 생성기
 * - 비밀번호와 비밀번호 확인 필드가 일치하는지 검증
 * @param getFieldValue - Form의 getFieldValue 함수
 * @param passwordFieldName - 원본 비밀번호 필드명 (기본값: 'password')
 * @returns Rule - Ant Design Form 검증 규칙
 * @example
 * <Form.Item name="confirmPassword" rules={[passwordConfirmRule(getFieldValue)]}>
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
 * 📁 파일 크기 검증 함수
 * - 업로드할 파일이 허용된 크기 이내인지 확인
 * @param file - 검증할 File 객체
 * @param maxSizeBytes - 최대 허용 크기 (바이트 단위)
 * @returns boolean - 크기가 허용 범위 내이면 true
 * @example
 * validateFileSize(file, 5 * 1024 * 1024) // 5MB 제한
 */
export const validateFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

/**
 * 📎 파일 확장자 검증 함수
 * - 업로드할 파일의 확장자가 허용된 형식인지 확인
 * @param file - 검증할 File 객체
 * @param allowedExtensions - 허용된 확장자 배열 (예: ['.pdf', '.jpg'])
 * @returns boolean - 확장자가 허용된 형식이면 true
 * @example
 * validateFileExtension(file, ['.pdf', '.docx'])
 */
export const validateFileExtension = (
  file: File,
  allowedExtensions: readonly string[],
): boolean => {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedExtensions.includes(fileExtension as any);
};

/**
 * 📋 공지사항 첨부파일 종합 검증 함수
 * - 공지사항 유형별로 파일 크기와 확장자를 동시에 검증
 * - LAW: .txt 파일만, EPIDEMIC/NEW_PRODUCT: .pdf 파일만 허용
 * @param file - 검증할 File 객체
 * @param announcementType - 공지사항 유형 ('LAW' | 'EPIDEMIC' | 'NEW_PRODUCT')
 * @returns string | null - 검증 실패 시 오류 메시지, 성공 시 null
 * @example
 * const error = validateAttachmentFile(file, 'LAW');
 * if (error) console.log(error); // "법령 카테고리는 .txt 파일만 지원합니다."
 */
export const validateAttachmentFile = (file: File, announcementType: string): string | null => {
  // 파일 크기 검증 (모든 유형 공통)
  if (!validateFileSize(file, FILE_UPLOAD.MAX_SIZE_BYTES)) {
    return `파일 크기는 ${FILE_UPLOAD.MAX_SIZE_MB}MB 이하여야 합니다.`;
  }

  // 유형별 확장자 검증
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
      return null; // 기타 유형은 검증하지 않음
  }

  return null; // 모든 검증 통과
};
