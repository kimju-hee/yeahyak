/**
 * 📞 연락처 번호 자동 포맷팅 함수
 * - 지역번호에 따라 적절한 하이픈(-) 형태로 포맷팅
 * - 02번: 02-000-0000 또는 02-0000-0000 형태
 * - 기타: 000-000-0000 또는 000-0000-0000 형태
 *
 * @param value - 포맷팅할 연락처 (숫자 또는 문자열)
 * @returns 하이픈이 추가된 연락처 문자열 또는 빈 문자열
 *
 * @example
 * formatContact('0212345678')   // → '02-1234-5678'
 * formatContact('01012345678')  // → '010-1234-5678'
 * formatContact('023456789')    // → '02-345-6789'
 * formatContact('')             // → ''
 * formatContact(undefined)      // → ''
 *
 * @note
 * - 입력값에서 숫자가 아닌 문자는 자동으로 제거됩니다
 * - 02로 시작하는 서울 지역번호는 특별한 형태로 포맷팅됩니다
 */
export const formatContact = (value: number | string | undefined): string => {
  if (!value) return '';
  const num = value.toString().replace(/\D/g, ''); // 숫자만 추출

  // 02번 (서울 지역번호) 처리
  if (num.startsWith('02')) {
    if (num.length <= 2) return num;
    if (num.length <= 6) return `${num.slice(0, 2)}-${num.slice(2)}`;
    // 10자리면 02-0000-0000, 9자리면 02-000-0000
    return num.length === 10
      ? `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6)}`
      : `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
  }

  // 기타 지역번호 및 휴대폰 번호 처리
  if (num.length <= 3) return num;
  if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
  // 11자리면 000-0000-0000, 10자리면 000-000-0000
  return num.length === 11
    ? `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
    : `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
};

/**
 * 🏢 사업자등록번호 자동 포맷팅 함수
 * - 표준 사업자등록번호 형태(000-00-00000)로 변환
 * - 10자리 숫자를 3-2-5 자리로 하이픈 구분
 *
 * @param value - 포맷팅할 사업자등록번호 (숫자 또는 문자열)
 * @returns 하이픈이 추가된 사업자등록번호 문자열 또는 빈 문자열
 *
 * @example
 * formatBizRegNo('1234567890')  // → '123-45-67890'
 * formatBizRegNo('123456789')   // → '123-45-6789'
 * formatBizRegNo('12345')       // → '123-45'
 * formatBizRegNo('123')         // → '123'
 * formatBizRegNo('')            // → ''
 * formatBizRegNo(undefined)     // → ''
 *
 * @note
 * - 입력값에서 숫자가 아닌 문자는 자동으로 제거됩니다
 * - 완전하지 않은 번호도 입력 길이에 따라 부분적으로 포맷팅됩니다
 */
export const formatBizRegNo = (value: number | string | undefined): string => {
  if (!value) return '';
  const num = value.toString().replace(/\D/g, ''); // 숫자만 추출

  if (num.length <= 3) return num;
  if (num.length <= 5) return `${num.slice(0, 3)}-${num.slice(3)}`;
  return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
};
