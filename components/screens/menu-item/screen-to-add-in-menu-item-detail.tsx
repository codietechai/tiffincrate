"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Star, Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface DailyItem {
  name: string;
  description: string;
}

interface MenuData {
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  rating?: number;
  reviewCount?: number;
  prepTime?: string;
  calories?: number;
  isVegetarian?: boolean;
  isBestseller?: boolean;
  mustTry?: boolean;
  imageUrl: string;
  weeklyItems: Record<string, DailyItem>;
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function MenuDetails({ menuData }: { menuData: MenuData }) {
  const [openDay, setOpenDay] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-100">
        <Image
          src={menuData.imageUrl}
          alt={menuData.name}
          width={672}
          height={420}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {menuData.isBestseller && (
            <Badge className="bg-orange-600">Bestseller</Badge>
          )}
          {menuData.mustTry && <Badge className="bg-green-600">Must Try</Badge>}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-4 h-4 border-2 flex items-center justify-center ${
                menuData.isVegetarian ? "border-green-600" : "border-red-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  menuData.isVegetarian ? "bg-green-600" : "bg-red-600"
                }`}
              />
            </div>
            <h1 className="text-xl font-semibold">{menuData.name}</h1>
          </div>
          <p className="text-gray-600 text-sm">{menuData.description}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          {menuData.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
              <span>{menuData.rating}</span>
              <span className="text-gray-500 text-xs">
                ({menuData.reviewCount})
              </span>
            </div>
          )}
          {menuData.prepTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{menuData.prepTime}</span>
            </div>
          )}
          {menuData.calories && (
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              <span>{menuData.calories} cal</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Weekday Accordion */}
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            {DAYS.map((day) => {
              const item = menuData.weeklyItems?.[day.key];
              if (!item) return null;

              const isOpen = openDay === day.key;
              return (
                <div key={day.key} className="border-b">
                  <button
                    className="flex justify-between items-center w-full py-3 px-2"
                    onClick={() =>
                      setOpenDay((prev) => (prev === day.key ? null : day.key))
                    }
                  >
                    <h3 className="font-medium text-base">{day.label}</h3>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-2 pb-3 text-sm space-y-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
