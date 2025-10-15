export interface TProvider {
  _id: string;
  userId: string;
  businessName: string;
  description?: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  isActive: boolean;
  operatingHours: {
    start: string;
    end: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
