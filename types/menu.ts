export interface TMenuItem {
  _id?: string;
  name: string;
  description?: string;
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
  providerId?: {
    _id: string;
    businessName: string;
  };
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  weeklyItems: TWeeklyMenu;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl?: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: "whole" | "weekdays" | "weekends";
  rating: number;
  draft?: boolean;
  userRatingCount?: number;
}
