export interface TReview {
  _id: string;
  consumerId: {
    name: string;
    email: string;
  };
  providerId: {
    businessName: string;
  };
  orderId: {
    totalAmount: number;
    createdAt: string;
  };
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
}

interface TProvider {
  _id: string;
  businessName: string;
}
