"use client";

import { Settings2 } from "lucide-react";
import HomeHeader from "./home-header";
import { useEffect, useState } from "react";
import VegNonVegSwitch from "./veg-switch";
import { Types } from "mongoose";
import { Badge } from "@/components/ui/badge";
import MenuItemHome from "./menu-item-home";
import { TMenu } from "@/app/(screens)/providers/[id]/page";

export interface IWeeklyMenu {
  monday?: Types.ObjectId | string;
  tuesday?: Types.ObjectId | string;
  wednesday?: Types.ObjectId | string;
  thursday?: Types.ObjectId | string;
  friday?: Types.ObjectId | string;
  saturday?: Types.ObjectId | string;
  sunday?: Types.ObjectId | string;
}

export interface IMenu {
  _id: string;
  providerId: string;
  name: string;
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  weeklyItems: IWeeklyMenu;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl?: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: "whole" | "weekdays" | "weekends";
  rating: number;
  draft: boolean;
  userRatingCount: number;
  createdAt: string;
  updatedAt: string;
}

const Home = () => {
  const [filters, setFilters] = useState({
    isVegetarian: true,
  });
  const [menus, setMenus] = useState<TMenu[]>([]);

  const filteredMenus = menus?.filter(
    (menu) => menu.isVegetarian === filters.isVegetarian
  );

  const fetchMenus = async () => {
    const res = await fetch(`/api/menus`);
    if (res.ok) {
      const data = await res.json();
      setMenus(data.menus);
    }
  };
  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div>
      <HomeHeader />
      <div className="mt-5 px-3">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-bold text-lg">Filters</h3>
          <Settings2 className="text-muted-foreground" />
        </div>

        <div className="mb-4">
          <VegNonVegSwitch filters={filters} setFilters={setFilters} />
        </div>

        {filteredMenus.map((menu) => (
          <MenuItemHome menu={menu} />
        ))}
      </div>
    </div>
  );
};

export default Home;
