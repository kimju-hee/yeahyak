import { CREDIT_CONSTANTS } from '../constants/pharmacy.constant';

/**
 * 💳 신용 한도 사용 정보 계산 유틸리티
 * - 약국의 외상 잔액을 기반으로 신용 한도 사용률과 관련 정보를 계산
 * - 시각적 표시를 위한 색상과 퍼센테지 정보 제공
 *
 * @param outstandingBalance - 현재 외상 잔액 (사용한 신용 금액)
 * @returns 신용 정보 객체
 *
 * @example
 * const creditInfo = calculateCreditInfo(750000); // 75만원 사용
 * console.log(creditInfo);
 * // {
 * //   usedAmount: 750000,        // 사용 금액
 * //   remainingAmount: 250000,   // 남은 한도
 * //   usagePercent: 75,          // 사용률 75%
 * //   remainingPercent: 25,      // 남은 비율 25%
 * //   totalLimit: 1000000,       // 총 한도
 * //   strokeColor: '#faad14'     // 주황색 (50-80% 구간)
 * // }
 *
 * @note
 * - 한도 초과 시에도 한도 내에서만 계산됩니다
 * - 색상 구분: 녹색(~50%), 주황색(50~80%), 빨간색(80%~)
 * - 퍼센테지는 소수점 둘째 자리까지 반올림됩니다
 */
export const calculateCreditInfo = (outstandingBalance: number) => {
  // 사용한 금액: 외상 잔액 (한도 내에서만 계산)
  const usedAmount = Math.max(0, Math.min(outstandingBalance, CREDIT_CONSTANTS.CREDIT_LIMIT));

  // 남은 금액: 총 한도에서 사용한 금액을 뺀 값
  const remainingAmount = CREDIT_CONSTANTS.CREDIT_LIMIT - usedAmount;

  // 사용 비율 계산 (0-100%)
  const usagePercent = (usedAmount / CREDIT_CONSTANTS.CREDIT_LIMIT) * 100;

  // 남은 비율 계산 (0-100%)
  const remainingPercent = Math.max(0, 100 - usagePercent);

  // 사용률에 따른 시각적 색상 결정
  // 녹색: 안전 구간 (~50%)
  // 주황색: 주의 구간 (50~80%)
  // 빨간색: 위험 구간 (80%~)
  const strokeColor =
    usagePercent <= 50
      ? '#52c41a' // 녹색 (안전)
      : usagePercent <= 80
        ? '#faad14' // 주황색 (주의)
        : '#f5222d'; // 빨간색 (위험)

  return {
    usedAmount, // 사용한 신용 금액
    remainingAmount, // 남은 신용 한도
    usagePercent: Math.round(usagePercent * 100) / 100, // 사용률 (소수점 2자리)
    remainingPercent: Math.round(remainingPercent * 100) / 100, // 남은 비율 (소수점 2자리)
    totalLimit: CREDIT_CONSTANTS.CREDIT_LIMIT, // 총 신용 한도
    strokeColor, // Progress Bar 색상
  };
};
