import { CREDIT_CONSTANTS } from '../constants/pharmacy.constant';

export const calculateCreditInfo = (outstandingBalance: number) => {
  // 사용한 금액: 현재 포인트
  const usedAmount = Math.max(0, Math.min(outstandingBalance, CREDIT_CONSTANTS.CREDIT_LIMIT));

  // 남은 금액: 한도 - 포인트
  const remainingAmount = CREDIT_CONSTANTS.CREDIT_LIMIT - usedAmount;

  // 사용 비율 (퍼센트)
  const usagePercent = (usedAmount / CREDIT_CONSTANTS.CREDIT_LIMIT) * 100;

  // 남은 비율 (퍼센트)
  const remainingPercent = Math.max(0, 100 - usagePercent);

  // 색상 결정
  const strokeColor = usagePercent <= 50 ? '#52c41a' : usagePercent <= 80 ? '#faad14' : '#f5222d';

  return {
    usedAmount,
    remainingAmount,
    usagePercent: Math.round(usagePercent * 100) / 100,
    remainingPercent: Math.round(remainingPercent * 100) / 100,
    totalLimit: CREDIT_CONSTANTS.CREDIT_LIMIT,
    strokeColor,
  };
};
