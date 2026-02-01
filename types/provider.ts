import { TPagination } from "./common";

export interface TProvider {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
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
    breakfast: { enabled: boolean; selfDelivery: boolean };
    lunch: { enabled: boolean; selfDelivery: boolean };
    dinner: { enabled: boolean; selfDelivery: boolean };
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  businessType: "restaurant" | "home_kitchen" | "cloud_kitchen";
  serviceRadius: number;
  avgDeliveryTime: number;
  createdAt: string;
  updatedAt: string;
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
