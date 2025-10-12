"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  IndianRupee,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Plus, Minus, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { Calendar } from "@/components/ui/calendar";

interface IWeeklyMenu {
  monday?: { name: string; description: string };
  tuesday?: { name: string; description: string };
  wednesday?: { name: string; description: string };
  thursday?: { name: string; description: string };
  friday?: { name: string; description: string };
  saturday?: { name: string; description: string };
  sunday?: { name: string; description: string };
}

interface IMenu {
  _id: string;
  name: string;
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  weeklyItems: IWeeklyMenu;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  weekType: "whole" | "weekdays" | "weekends";
  rating: number;
  userRatingCount: number;
}

interface MenuItemDetailProps {
  onAddToCart: (item: any) => void;
}

// ✅ Dummy data matching schema
const dummyMenu: IMenu = {
  _id: "menu_01",
  name: "North Indian Lunch Plan",
  description:
    "Wholesome, freshly cooked North Indian meals for your week. Enjoy rotating dishes daily with a focus on taste and nutrition.",
  category: "lunch",
  weeklyItems: {
    monday: {
      name: "Rajma Chawal",
      description: "Kidney beans curry with rice",
    },
    tuesday: {
      name: "Aloo Gobi & Roti",
      description: "Potato and cauliflower curry",
    },
    wednesday: {
      name: "Chole Bhature",
      description: "Spicy chickpeas with fluffy bread",
    },
    thursday: {
      name: "Mix Veg & Jeera Rice",
      description: "Seasonal veggies with cumin rice",
    },
    friday: {
      name: "Paneer Butter Masala",
      description: "Creamy paneer curry with naan",
    },
    saturday: {
      name: "Kadhi Pakora & Rice",
      description: "Yogurt curry with fried dumplings",
    },
    sunday: {
      name: "Veg Biryani & Raita",
      description: "Spiced rice served with curd",
    },
  },
  basePrice: 179,
  monthlyPlanPrice: 4800,
  imageUrl: [
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800",
  ],
  isAvailable: true,
  isVegetarian: true,
  weekType: "whole",
  rating: 4.6,
  userRatingCount: 920,
};

const weekDays = [
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
];

export function MenuItemDetail({ onAddToCart }: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<any>(null);
  const params = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  const [orderData, setOrderData] = useState<{
    deliveryAddress: string;
    deliveryDate: string;
    deliveryPeriod: "month" | "specific_days" | "custom_dates";
    dates: string;
    recurring?: number;
    timeSlot: string;
    notes: string;
  }>({
    deliveryAddress: "",
    deliveryPeriod: "month",
    dates: "",
    deliveryDate: "",
    timeSlot: "",
    notes: "",
  });
  const [multiDates, setMultiDates] = useState<Date[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    orderData.dates ? orderData.dates.split(",") : []
  );

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const updated = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      setOrderData((prevOrder) => ({
        ...prevOrder,
        dates: updated.join(","),
      }));
      return updated;
    });
  };

  const menu = dummyMenu;
  const checkFavoriteStatus = async () => {
    const res = await fetch("/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setIsFavorite(data.favorites.some((f: any) => f._id === params.id));
    }
  };
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role === "consumer") checkFavoriteStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    checkAuth();
    // }, [params.id]);
  }, []);
  const handleAddToCart = () => {
    onAddToCart({
      id: menu._id,
      name: menu.name,
      quantity,
      basePrice: menu.basePrice,
      total: menu.basePrice * quantity,
    });
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
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
        <Card className="rounded-none overflow-hidden">
          <div className="relative aspect-[16/10] bg-gray-100">
            <Image
              height={420}
              width={672}
              src={menu.imageUrl[0]}
              alt={menu.name}
              className="w-full h-full object-cover"
            />
            {menu.isVegetarian && (
              <Badge className="absolute top-4 right-4 bg-green-600 text-white">
                Veg
              </Badge>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Title + Description */}
            <div>
              <h1 className="text-2xl font-semibold mb-2">{menu.name}</h1>
              <p className="text-gray-600">{menu.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  <span className="font-medium">{menu.rating}</span>
                  <span className="text-gray-500 text-sm">
                    ({menu.userRatingCount})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="h-4 w-4" />
                  <span className="text-sm capitalize">{menu.weekType}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Weekly Plan */}
            <div>
              <h3 className="font-medium mb-3">Weekly Menu</h3>
              <Accordion type="single" collapsible>
                {Object.entries(menu.weeklyItems).map(([day, item]) => (
                  <AccordionItem key={day} value={day}>
                    <AccordionTrigger className="capitalize font-medium text-base">
                      {day}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">{item.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div>
              <h3 className="font-medium mb-2">Pricing</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-lg">
                    {menu.basePrice}
                  </span>
                  <span className="text-gray-500 ml-1">per meal</span>
                </div>
                {menu.monthlyPlanPrice && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>₹{menu.monthlyPlanPrice} monthly</span>
                  </div>
                )}
              </div>
            </div>
            {user?.role === "consumer" && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">
                      Delivery Address
                    </label>
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter your delivery address"
                          value={orderData.deliveryAddress}
                          onChange={(e) =>
                            setOrderData((prev) => ({
                              ...prev,
                              deliveryAddress: e.target.value,
                            }))
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/map-selector?returnUrl=${encodeURIComponent(
                                window.location.pathname
                              )}`
                            )
                          }
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click the map icon to select location on map
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Period</Label>
                    <Select
                      value={orderData.deliveryPeriod}
                      onValueChange={(
                        value: "month" | "specific_days" | "custom_dates"
                      ) =>
                        setOrderData((prev) => ({
                          ...prev,
                          deliveryPeriod: value,
                          dates: "",
                          recurring: undefined,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="specific_days">
                          Specific Days
                        </SelectItem>
                        <SelectItem value="custom_dates">
                          Custom Dates
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* For specific days (week selection + recurrence) */}
                  {orderData.deliveryPeriod === "specific_days" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Recurring Every (weeks)</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 1 for every week"
                          value={orderData.recurring ?? ""}
                          onChange={(e) =>
                            setOrderData((prev) => ({
                              ...prev,
                              recurring: Number(e.target.value),
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Select Days of the Week</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {weekDays.map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant={
                                selectedDays.includes(day.value)
                                  ? "default"
                                  : "outline"
                              }
                              className={clsx(
                                "text-sm",
                                selectedDays.includes(day.value) &&
                                  "bg-primary text-white"
                              )}
                              onClick={() => toggleDay(day.value)}
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* For custom multiple dates */}
                  {orderData.deliveryPeriod === "custom_dates" && (
                    <div className="space-y-2">
                      <Label>Select Custom Dates</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            {multiDates.length > 0
                              ? `${multiDates.length} date(s) selected`
                              : "Select Dates"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Calendar
                            mode="multiple"
                            selected={multiDates}
                            onSelect={(days) => {
                              setMultiDates(days || []);
                              setOrderData((prev) => ({
                                ...prev,
                                dates: (days || [])
                                  .map((d) => format(d, "yyyy-MM-dd"))
                                  .join(","),
                              }));
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">
                      Time Slot & Delivery Date
                    </label>
                    <div className="mt-1 space-y-2">
                      <Select
                        value={orderData.timeSlot} // use timeSlot directly
                        onValueChange={(value) =>
                          setOrderData((prev) => ({
                            ...prev,
                            timeSlot: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">
                            Breakfast (6:00 AM - 8:00 AM)
                          </SelectItem>
                          <SelectItem value="lunch">
                            Lunch (1:00 PM - 3:00 PM)
                          </SelectItem>
                          <SelectItem value="dinner">
                            Dinner (9:00 PM - 11:00 PM)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {/* <Input
                              type="date"
                              value={orderData.deliveryDate}
                              onChange={(e) =>
                                setOrderData((prev) => ({
                                  ...prev,
                                  deliveryDate: e.target.value,
                                }))
                              }
                              min={new Date().toISOString().slice(0, 10)}
                            /> */}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Special Instructions (Optional)
                    </label>
                    <Textarea
                      placeholder="Any special requests or notes"
                      value={orderData.notes}
                      onChange={(e) =>
                        setOrderData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="my-4 border-b w-full"></div>

                <Button
                  // onClick={handlePlaceOrder}
                  // disabled={
                  //   isOrdering ||
                  //   !orderData.deliveryAddress ||
                  //   !orderData.deliveryDate
                  // }
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {/* {isOrdering
                        ? "Processing..."
                        : `Place Order - ₹${getCartTotal()}`} */}
                  Place Order
                </Button>
              </div>
            )}
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
          >
            Add to Cart • ₹{(menu.basePrice * quantity).toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
