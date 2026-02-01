export interface TMenuItem {
  _id?: string;
  name: string;
  description?: string;
  menuId: string;
  images: string[];
  day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  nutritionInfo?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
  allergens: string[];
  isSpicy: boolean;
  spiceLevel: "mild" | "medium" | "hot" | "extra-hot";
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TWeeklyMenu {
  monday?: TMenuItem;
  tuesday?: TMenuItem;
  wednesday?: TMenuItem;
  thursday?: TMenuItem;
  friday?: TMenuItem;
  saturday?: TMenuItem;
  sunday?: TMenuItem;
}

export interface TMenu {
  _id: string;
  name: string;
  providerId: {
    _id: string;
    businessName: string;
  };
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  menuItems: TMenuItem[];
  basePrice: number;
  monthlyPlanPrice?: number;
  image?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: "whole" | "weekdays" | "weekends";
  rating: number;
  userRatingCount: number;
  tags: string[];
  preparationTime: number;
  servingSize: number;
  createdAt: string;
  updatedAt: string;
}
