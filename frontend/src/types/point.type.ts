export interface Point {
  pointId: number;
  userId: number;
  amount: number;
  status: PointStatus;
  requestedAt: string;
}

export const POINT_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type PointStatus = keyof typeof POINT_STATUS;

export interface PointRequest {
  userId: number;
  amount: number;
}
