import { CREDIT_CONSTANTS } from '../constants';

/**
 * 사용자 포인트를 기반으로 크레딧 정보를 계산합니다.
 * @param userPoint 사용자 포인트 (0에서 -10000000 사이)
 * @returns 크레딧 정보 객체
 */
export const calculateCreditInfo = (userPoint: number) => {
  // 사용한 금액 (절댓값)
  const usedAmount = Math.abs(Math.min(userPoint, 0));

  // 남은 금액
  const remainingAmount = CREDIT_CONSTANTS.CREDIT_LIMIT - usedAmount;

  // 사용 비율 (퍼센트)
  const usagePercent = (usedAmount / CREDIT_CONSTANTS.CREDIT_LIMIT) * 100;

  // 남은 비율 (퍼센트)
  const remainingPercent = Math.max(0, 100 - usagePercent);

  // 색상 결정
  const strokeColor =
    remainingPercent >= 50 ? '#52c41a' : remainingPercent >= 20 ? '#faad14' : '#f5222d';

  return {
    usedAmount,
    remainingAmount,
    usagePercent: Math.round(usagePercent * 100) / 100,
    remainingPercent: Math.round(remainingPercent * 100) / 100,
    totalLimit: CREDIT_CONSTANTS.CREDIT_LIMIT,
    strokeColor,
  };
};
