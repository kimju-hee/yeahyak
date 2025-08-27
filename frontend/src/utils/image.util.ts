export const PLACEHOLDER =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

export function getProductImgSrc(raw: string | undefined): string {
  if (!raw) return PLACEHOLDER;
  if (raw === '') return PLACEHOLDER;

  if (raw.startsWith('data:')) return raw;
  if (raw.startsWith('http')) return raw;

  if (/^[A-Za-z0-9+/=]+$/.test(raw)) return `data:image/*;base64,${raw}`;

  return PLACEHOLDER;
}
