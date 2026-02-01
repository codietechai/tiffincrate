export interface TAddress {
  _id: string;
  userId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone?: string;
  isDefault: boolean;
  addressType: "home" | "office" | "other";
  landmark?: string;
  deliveryInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Virtual fields
  fullAddress?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
