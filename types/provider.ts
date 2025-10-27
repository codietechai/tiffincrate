import { TPagination } from "./common";

export interface TProvider {
  _id: string;
  userId: {
    name: string;
  };
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

export interface TProviderQueryData {
  area?: string;
  cuisine?: string;
  page: number;
  limit: number;
  search?: string;
  sorting?: string;
}

export interface TFetchProvidersResponse {
  data: TProvider[];
  message: string;
  pagination: TPagination;
}
