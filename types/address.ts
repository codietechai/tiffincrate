export interface TAddress {
  _id: string;
  user_id?: string;

  name: string;
  address_line_1: string;
  address_line_2?: string;

  city: string;
  region: string;
  country: string;

  latitude?: number;
  longitude?: number;

  country_code: string;
  postal_code: string;

  dial_code?: string;
  phone_number?: string;
  full_phone_number?: string;

  is_default: boolean;

  email?: string;

  address_mutability: "mutable" | "immutable";

  created_at: string;
  updated_at: string;
}
