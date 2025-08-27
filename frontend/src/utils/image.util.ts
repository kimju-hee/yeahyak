/**
 * 🖼️ 이미지 처리 및 표시 유틸리티
 * - 제품 이미지 소스 처리 및 폴백 처리
 * - 다양한 이미지 형식 지원 (URL, Base64, 원시 데이터)
 */

/**
 * 📷 기본 플레이스홀더 이미지 URL
 * - 이미지가 없거나 로드 실패 시 표시되는 기본 이미지
 */
export const PLACEHOLDER =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

/**
 * 🔄 제품 이미지 소스 URL 처리 및 변환
 * - 다양한 형태의 이미지 데이터를 웹에서 표시 가능한 URL로 변환
 * - 유효하지 않은 데이터는 플레이스홀더 이미지로 폴백
 *
 * @param raw - 원시 이미지 데이터 (URL, Base64, 또는 원시 문자열)
 * @returns 웹에서 표시 가능한 이미지 URL
 *
 * @example
 * // 다양한 입력 처리 예시
 * getProductImgSrc('https://example.com/image.jpg')     // → 'https://example.com/image.jpg'
 * getProductImgSrc('data:image/png;base64,iVBORw0K...')  // → 'data:image/png;base64,iVBORw0K...'
 * getProductImgSrc('iVBORw0KGgoAAAANSUhEUgAA...')        // → 'data:image/*;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 * getProductImgSrc('')                                   // → PLACEHOLDER
 * getProductImgSrc(undefined)                           // → PLACEHOLDER
 *
 * @note
 * - 지원 형식: HTTP/HTTPS URL, Data URL, Base64 문자열
 * - 빈 값이나 유효하지 않은 데이터는 자동으로 플레이스홀더로 대체
 */
export function getProductImgSrc(raw: string | undefined): string {
  // null, undefined, 빈 문자열 처리
  if (!raw || raw === '') return PLACEHOLDER;

  // 이미 Data URL 형태인 경우 그대로 반환
  if (raw.startsWith('data:')) return raw;

  // HTTP/HTTPS URL인 경우 그대로 반환
  if (raw.startsWith('http')) return raw;

  // Base64 문자열 패턴 검증 후 Data URL로 변환
  // 영문자, 숫자, +, /, = 문자만 포함된 경우 Base64로 판단
  if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
    return `data:image/*;base64,${raw}`;
  }

  // 위 조건에 맞지 않는 경우 플레이스홀더 반환
  return PLACEHOLDER;
}
