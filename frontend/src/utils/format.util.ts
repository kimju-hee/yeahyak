/**
 * 연락처 포맷터
 * 02-000-0000 또는 02-0000-0000
 * 000-000-0000 또는 000-0000-0000
 */
export const formatContact = (value: number | string | undefined): string => {
  if (!value) return '';
  const num = value.toString().replace(/\D/g, '');

  // 02-000-0000 또는 02-0000-0000
  if (num.startsWith('02')) {
    if (num.length <= 2) return num;
    if (num.length <= 6) return `${num.slice(0, 2)}-${num.slice(2)}`;
    return num.length === 10
      ? `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6)}`
      : `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
  }

  // 000-000-0000 또는 000-0000-0000
  if (num.length <= 3) return num;
  if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
  return num.length === 11
    ? `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
    : `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
};

/**
 * 사업자등록번호 포맷터 (000-00-00000)
 */
export const formatBizRegNo = (value: number | string | undefined): string => {
  if (!value) return '';
  const num = value.toString().replace(/\D/g, '');
  if (num.length <= 3) return num;
  if (num.length <= 5) return `${num.slice(0, 3)}-${num.slice(3)}`;
  return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
};
