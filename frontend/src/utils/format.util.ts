/**
 * 연락처 번호를 하이픈 형태로 자동 포맷팅
 * @param value 포맷팅할 연락처
 * @returns 하이픈이 추가된 연락처 문자열
 */
export const formatContact = (value: number | string | undefined): string => {
  if (!value) return '';
  const num = value.toString().replace(/\D/g, ''); // 숫자만 추출

  // 02번 (서울 지역번호) 처리
  if (num.startsWith('02')) {
    if (num.length <= 2) return num;
    if (num.length <= 6) return `${num.slice(0, 2)}-${num.slice(2)}`;
    return num.length === 10
      ? `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6)}`
      : `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
  }

  // 기타 지역번호 및 휴대폰 번호 처리
  if (num.length <= 3) return num;
  if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
  return num.length === 11
    ? `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
    : `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
};

/**
 * 사업자등록번호를 표준 형태(000-00-00000)로 포맷팅
 * @param value 포맷팅할 사업자등록번호
 * @returns 하이픈이 추가된 사업자등록번호 문자열
 */
export const formatBizRegNo = (value: number | string | undefined): string => {
  if (!value) return '';
  const num = value.toString().replace(/\D/g, ''); // 숫자만 추출

  if (num.length <= 3) return num;
  if (num.length <= 5) return `${num.slice(0, 3)}-${num.slice(3)}`;
  return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
};
