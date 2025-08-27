import type { KeyboardEvent } from 'react';

/**
 * 숫자만 입력 가능하도록 하는 키 다운 핸들러
 */
export const handleNumberOnlyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  // 숫자, 백스페이스, 삭제, 탭, 화살표 키만 허용
  if (
    !/[0-9]/.test(e.key) &&
    !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
      e.key,
    )
  ) {
    e.preventDefault();
  }
};
