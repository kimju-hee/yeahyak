import type { KeyboardEvent } from 'react';

/**
 * 🔢 숫자만 입력 허용 키보드 이벤트 핸들러
 * - 숫자(0-9)와 편집 키(백스페이스, 삭제, 탭, 화살표)만 허용
 * - 기타 문자 입력을 차단하여 숫자 전용 입력 필드 구현
 *
 * @param e - 키보드 이벤트 객체
 * @example
 * <Input
 *   type="text"
 *   onKeyDown={handleNumberOnlyKeyDown}
 *   placeholder="숫자만 입력 가능"
 * />
 *
 * @note
 * - 허용 키: 0-9, Backspace, Delete, Tab, Arrow Keys
 * - 차단 키: 영문자, 특수문자, 한글 등
 */
export const handleNumberOnlyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  // 허용되는 키 목록: 숫자 + 편집/이동 키
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
  ];

  // 숫자가 아니고 허용되지 않는 키인 경우 입력 차단
  if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};
