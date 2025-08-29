/**
 * 이미지 처리 및 표시 유틸리티
 */

/** 기본 플레이스홀더 이미지 URL */
export const PLACEHOLDER =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

/**
 * 제품 이미지를 웹에서 표시 가능한 URL로 변환
 * @param raw 원시 이미지 데이터 (URL, Base64 등)
 * @returns 표시 가능한 이미지 URL 또는 플레이스홀더
 */
export function getProductImgSrc(raw: string | undefined): string {
  // 빈 값 처리
  if (!raw || raw === '') return PLACEHOLDER;

  // 이미 Data URL 형태인 경우
  if (raw.startsWith('data:')) return raw;

  // HTTP/HTTPS URL인 경우
  if (raw.startsWith('http')) return raw;

  // Base64 문자열인 경우 Data URL로 변환
  if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
    return `data:image/*;base64,${raw}`;
  }

  // 기타 경우 플레이스홀더 반환
  return PLACEHOLDER;
}
