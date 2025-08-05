import type { Pharmacy, PharmacyStatus } from './profile.type';

export interface RegRequestResponse {
  request: RegRequest;
  pharmacy: Pharmacy;
}

export interface RegRequest {
  id: number;
  pharmacyId: number;
  requestedAt: string;
  status: PharmacyStatus;
  reviewedAt?: string;
}
