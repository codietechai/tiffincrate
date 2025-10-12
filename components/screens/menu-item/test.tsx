"use client";

import { useState } from "react";
import { ArrowLeft, Star, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MenuItemDetailProps {
  onAddToCart: (item: any) => void;
}

export function MenuItemDetail({ onAddToCart }: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<"regular" | "large">(
    "regular"
  );
  const [customizations, setCustomizations] = useState({
    spiceLevel: "medium" as "mild" | "medium" | "hot" | "extra-hot",
    addOns: [] as string[],
  });

  const menuItem = {
    id: "1",
    name: "Paneer Butter Masala",
    description:
      "Rich and creamy cottage cheese curry cooked in a tomato-based gravy with butter, cream, and aromatic spices.",
    price: { regular: 280, large: 380 },
    rating: 4.5,
    reviewCount: 1250,
    prepTime: "25-30 mins",
    isVeg: true,
    calories: 320,
    serves: 2,
    isBestseller: true,
    mustTry: true,
    ingredients: [
      "Paneer (Cottage Cheese)",
      "Tomatoes",
      "Butter",
      "Cream",
      "Onions",
      "Cashew Paste",
      "Ginger-Garlic Paste",
      "Kasuri Methi",
      "Red Chili Powder",
      "Garam Masala",
      "Kashmiri Red Chili",
    ],
    nutritionInfo: {
      calories: 320,
      protein: "12g",
      carbs: "18g",
      fat: "22g",
      fiber: "3g",
    },
  };

  const addOnsOptions = [
    { id: "extra-paneer", name: "Extra Paneer", price: 50 },
    { id: "extra-gravy", name: "Extra Gravy", price: 30 },
    { id: "butter-topping", name: "Butter Topping", price: 20 },
  ];

  const toggleAddOn = (addonId: string) => {
    setCustomizations((prev) => ({
      ...prev,
      addOns: prev.addOns.includes(addonId)
        ? prev.addOns.filter((id) => id !== addonId)
        : [...prev.addOns, addonId],
    }));
  };

  const calculateTotal = () => {
    let total = menuItem.price[selectedSize] * quantity;
    customizations.addOns.forEach((addonId) => {
      const addon = addOnsOptions.find((a) => a.id === addonId);
      if (addon) total += addon.price * quantity;
    });
    return total;
  };

  const handleAddToCart = () => {
    onAddToCart({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price[selectedSize],
      quantity,
      isVeg: menuItem.isVeg,
      customizations,
    });
  };

  const DAYS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden rounded-none">
          <div className="relative aspect-[16/10] bg-gray-100">
            <Image
              height={420}
              width={672}
              src="https://images.unsplash.com/photo-1708793873401-e8c6c153b76a"
              alt={menuItem.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              {menuItem.isBestseller && (
                <Badge className="bg-orange-600">Bestseller</Badge>
              )}
              {menuItem.mustTry && (
                <Badge className="bg-green-600">Must Try</Badge>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-5 h-5 border-2 flex items-center justify-center ${
                        menuItem.isVeg ? "border-green-600" : "border-red-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          menuItem.isVeg ? "bg-green-600" : "bg-red-600"
                        }`}
                      />
                    </div>
                    <h1 className="text-2xl font-semibold">{menuItem.name}</h1>
                  </div>
                  <p className="text-gray-600">{menuItem.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                  <span>{menuItem.rating}</span>
                  <span className="text-gray-500 text-sm">
                    ({menuItem.reviewCount})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{menuItem.prepTime}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm">{menuItem.calories} cal</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Choose Size */}
            <div>
              <h3 className="mb-3 font-medium">Choose Size</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedSize("regular")}
                  className={`border-2 rounded-lg p-4 text-left transition-colors ${
                    selectedSize === "regular"
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>Regular</div>
                  <div className="text-sm text-gray-600">
                    Serves {menuItem.serves}
                  </div>
                  <div className="mt-1">₹{menuItem.price.regular}</div>
                </button>
                <button
                  onClick={() => setSelectedSize("large")}
                  className={`border-2 rounded-lg p-4 text-left transition-colors ${
                    selectedSize === "large"
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>Large</div>
                  <div className="text-sm text-gray-600">
                    Serves {menuItem.serves + 1}
                  </div>
                  <div className="mt-1">₹{menuItem.price.large}</div>
                </button>
              </div>
            </div>

            <Accordion type="single" collapsible>
              {DAYS.map((day) => {
                const item = {
                  monday: {
                    name: "Rajma Chawal",
                    description:
                      "Comforting kidney beans curry served with basmati rice.",
                  },
                  tuesday: {
                    name: "Aloo Gobi & Roti",
                    description:
                      "Dry spiced cauliflower and potato curry with 3 rotis.",
                  },
                  wednesday: {
                    name: "Chole Bhature",
                    description:
                      "Tangy chickpea curry served with fluffy bhaturas.",
                  },
                  thursday: {
                    name: "Mix Veg & Jeera Rice",
                    description:
                      "Colorful vegetable curry with fragrant cumin rice.",
                  },
                  friday: {
                    name: "Paneer Butter Masala",
                    description:
                      "Rich and creamy paneer curry with butter naan.",
                  },
                  saturday: {
                    name: "Kadhi Pakora & Rice",
                    description:
                      "Gram flour dumplings simmered in yogurt-based curry.",
                  },
                  sunday: {
                    name: "Veg Biryani with Raita",
                    description:
                      "Aromatic spiced rice dish served with fresh curd.",
                  },
                }?.[day.key];
                if (!item) return null;

                return (
                  <AccordionItem
                    key={day.key}
                    value={day.key}
                    className="border-b"
                  >
                    <AccordionTrigger className="py-3 px-2 font-medium text-base">
                      {day.label}
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-3 text-sm space-y-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">{item.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <Separator />

            {/* Spice Level */}
            <div>
              <h3 className="mb-3 font-medium">Spice Level</h3>
              <div className="grid grid-cols-4 gap-2">
                {(["mild", "medium", "hot", "extra-hot"] as const).map(
                  (level) => (
                    <Button
                      key={level}
                      variant={
                        customizations.spiceLevel === level
                          ? "default"
                          : "outline"
                      }
                      className={`capitalize border text-black ${
                        customizations.spiceLevel === level
                          ? " bg-orange-50 hover:bg-orange-100  border-orange-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setCustomizations((prev) => ({
                          ...prev,
                          spiceLevel: level,
                        }))
                      }
                    >
                      {level.replace("-", " ")}
                    </Button>
                  )
                )}
              </div>
            </div>

            <Separator />

            {/* Add-ons */}
            <div>
              <h3 className="mb-3 font-medium">Add-ons (Optional)</h3>
              <div className="space-y-3">
                {addOnsOptions.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={customizations.addOns.includes(addon.id)}
                        onCheckedChange={() => toggleAddOn(addon.id)}
                      />
                      <span>{addon.name}</span>
                    </div>
                    <span className="text-gray-600">+₹{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Accordion for Nutrition and Ingredients */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="nutrition">
                <AccordionTrigger className="">
                  Nutrition Information
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {Object.entries(menuItem.nutritionInfo).map(
                      ([key, value]) => (
                        <div key={key} className="border rounded-lg p-3">
                          <div className="text-sm text-gray-600 capitalize">
                            {key}
                          </div>
                          <div>{value}</div>
                        </div>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-none" value="ingredients">
                <AccordionTrigger>Ingredients</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {menuItem.ingredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Card>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-12 w-12"
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="h-12 w-12"
            >
              +
            </Button>
          </div>
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-orange-600 hover:bg-orange-700 h-12"
            size="lg"
          >
            Add to Cart • ₹{calculateTotal().toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
