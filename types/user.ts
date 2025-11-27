export interface TDecoded {
  userId: string;
  email: string;
  role: string;
}

export interface TUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "provider" | "consumer" | "delivery_partner";
  phone?: string;
  address?: string;
  isActive: boolean;
  favorites?: string[];
  settings?: any;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
