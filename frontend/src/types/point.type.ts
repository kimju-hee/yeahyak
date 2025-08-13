export interface CreditResponse {
  userId: number;
  email: string;
  pharmacyName: string;
  point: number;
  creditStatus: CreditStatus;
}

export const CREDIT_STATUS = {
  FULL: 'FULL',
  SETTLEMENT_REQUIRED: 'SETTLEMENT_REQUIRED',
} as const;
export type CreditStatus = keyof typeof CREDIT_STATUS;

export const CREDIT_LIMIT = -10000000;
