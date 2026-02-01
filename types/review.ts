export interface TReview {
  _id: string;
  consumerId: {
    _id: string;
    name: string;
    email: string;
  };
  providerId: {
    _id: string;
    businessName: string;
  };
  orderId: {
    _id: string;
    totalAmount: number;
    createdAt: string;
  };
  deliveryOrderId?: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  reviewType: "order" | "provider" | "delivery";
  images?: string[];
  helpfulCount: number;
  reportCount: number;
  isHidden: boolean;
  moderatedAt?: string;
  moderatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
