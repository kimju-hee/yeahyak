import { CREDIT_LIMIT } from '../constants';

/**
 * 신용 한도 사용 정보를 계산하는 함수
 * @param outstandingBalance 현재 외상 잔액
 * @returns 신용 한도 정보 (사용량, 남은 금액, 색상 등)
 */
export const calculateCreditInfo = (outstandingBalance: number) => {
  // 사용한 금액 (한도 내에서만 계산)
  const usedAmount = Math.max(0, Math.min(outstandingBalance, CREDIT_LIMIT));

  // 남은 금액
  const remainingAmount = CREDIT_LIMIT - usedAmount;

  // 사용률과 남은 비율 계산
  const usagePercent = (usedAmount / CREDIT_LIMIT) * 100;
  const remainingPercent = Math.max(0, 100 - usagePercent);

  // 사용률에 따른 색상: 녹색(50%이하) → 주황색(50-80%) → 빨간색(80%이상)
  const strokeColor =
    usagePercent <= 50
      ? '#52c41a' // 녹색
      : usagePercent <= 80
        ? '#faad14' // 주황색
        : '#f5222d'; // 빨간색

  return {
    usedAmount, // 사용한 신용 금액
    remainingAmount, // 남은 신용 한도
    usagePercent: Math.round(usagePercent * 100) / 100, // 사용률 (소수점 2자리)
    remainingPercent: Math.round(remainingPercent * 100) / 100, // 남은 비율 (소수점 2자리)
    totalLimit: CREDIT_LIMIT, // 총 신용 한도
    strokeColor, // Progress Bar 색상
  };
};
