import type { KeyboardEvent } from 'react';

/**
 * 숫자만 입력 허용하는 키보드 이벤트 핸들러
 * @param e 키보드 이벤트 객체
 */
export const handleNumberOnlyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  // 허용되는 키: 숫자 + 편집/이동 키
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
  ];

  // 숫자가 아니고 허용되지 않는 키인 경우 차단
  if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};
