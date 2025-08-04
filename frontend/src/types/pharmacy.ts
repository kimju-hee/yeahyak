export interface Pharmacy {
  pharmacyId: number;
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
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  reviewedAt?: string;
}
