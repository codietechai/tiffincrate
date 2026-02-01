export interface TDecoded {
  userId: string;
  email: string;
  role: string;
}

export interface TUser {
  _id: string;
  name: string;
  email: string;
  password?: string; // Optional since it's excluded from queries
  role: "admin" | "provider" | "consumer";
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  favorites?: string[];
  tokenVersion: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
