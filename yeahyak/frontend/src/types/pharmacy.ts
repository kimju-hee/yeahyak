export interface Pharmacy {
  id: number;
  userId: number;
  pharmacyName: string;
  bizRegNo: string;
  representativeName: string;
  postcode: string;
  address: string;
  detailAddress: string;
  contact: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

export interface PharmacyRegistraionRequest {
  id: number;
  pharmacyId: number;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
}
