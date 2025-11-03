"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  IndianRupee,
  Calendar as CalendarIcon,
  Users,
  MapPin,
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { CartItem } from "@/app/(screens)/providers/[id]/page";

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
  providerId: string | null;
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

const getValidDays = (weeklyItems: IWeeklyMenu) => {
  return Object.keys(weeklyItems) as (keyof IWeeklyMenu)[];
};

const dayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function MenuItemDetail() {
  const [user, setUser] = useState<any>(null);
  const params = useParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [menu, setMenu] = useState<IMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  const [orderData, setOrderData] = useState({
    deliveryAddress: "",
    deliveryDate: "",
    deliveryPeriod: "month" as "month" | "specific_days" | "custom_dates",
    dates: "",
    recurring: undefined as number | undefined,
    timeSlot: "",
    notes: "",
  });

  const [multiDates, setMultiDates] = useState<Date[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const weekDays = [
    { label: "Mon", value: "monday" },
    { label: "Tue", value: "tuesday" },
    { label: "Wed", value: "wednesday" },
    { label: "Thu", value: "thursday" },
    { label: "Fri", value: "friday" },
    { label: "Sat", value: "saturday" },
    { label: "Sun", value: "sunday" },
  ];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const updated = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      setOrderData((prevOrder) => ({ ...prevOrder, dates: updated.join(",") }));
      return updated;
    });
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch(`/api/menus/${params.id}`);
      console.log(res);
      if (!res.ok) throw new Error("Failed to fetch menu");
      const data = await res.json();
      setMenu(data.menu);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchMenu();
  }, [params.id]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const getNextWeekdayDates = (days: string[], countWeeks = 1) => {
    const today = new Date();
    const dates: Date[] = [];

    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    for (let i = 0; i < countWeeks; i++) {
      days.forEach((day) => {
        const targetDay = dayMap[day];
        const diff = ((targetDay + 7 - today.getDay()) % 7) + i * 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + diff);
        dates.push(nextDate);
      });
    }

    return dates;
  };

  if (loading) return <p className="p-6">Loading menu...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!menu) return <p className="p-6">No menu found.</p>;

  const handlePlaceOrder = async () => {
    if (!user || user.role !== "consumer") {
      router.push("/auth/login");
      return;
    }

    const autoTimeSlot = menu?.category; // "breakfast" | "lunch" | "dinner"
    setIsOrdering(true);

    try {
      // Determine total number of delivery days
      let totalDays = 0;
      let deliveryInfo: any = { type: orderData.deliveryPeriod };

      if (orderData.deliveryPeriod === "month") {
        // assume 30 days for monthly plan
        totalDays = 30;
        deliveryInfo.startDate = new Date().toISOString().split("T")[0];
      } else if (orderData.deliveryPeriod === "specific_days") {
        // count selected weekdays for 4 weeks (1 month)
        totalDays = selectedDays.length * 4;
        deliveryInfo.days = selectedDays;
      } else if (orderData.deliveryPeriod === "custom_dates") {
        // count manually selected dates
        totalDays = multiDates.length;
        deliveryInfo.dates = multiDates.map((date) =>
          date.toLocaleDateString("en-CA")
        );
      }

      const totalAmount = menu.basePrice * totalDays;

      // Create Razorpay order for full amount
      const razorpayResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
        }),
      });

      const razorpayOrder = await razorpayResponse.json();
      if (!razorpayResponse.ok) throw new Error(razorpayOrder.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: "TiffinCrate",
        order_id: razorpayOrder.order.id,
        handler: async (response: any) => {
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              providerId: menu.providerId,
              items: [
                {
                  menuItemId: menu._id,
                  name: menu.name,
                  price: menu.basePrice,
                  quantity: totalDays,
                },
              ],
              totalAmount,
              deliveryAddress: orderData.deliveryAddress,
              orderType: orderData.deliveryPeriod,
              deliveryInfo,
              timeSlot: autoTimeSlot,
              paymentMethod: "razorpay",
              notes: orderData.notes,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          router.push("/order-history");
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#3B82F6" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Failed to place order");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-700"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
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
              <h1 className="text-xl font-semibold mb-2">{menu.name}</h1>
              <p className="text-gray-600">{menu.description}</p>
            </div>

            <Separator />

            {/* Weekly Menu */}
            <Accordion type="single" collapsible>
              {Object.entries(menu.weeklyItems).map(([day, item]) => (
                <AccordionItem key={day} value={day}>
                  <AccordionTrigger className="capitalize font-medium">
                    {day}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="font-medium">{item?.name}</p>
                    <p className="text-gray-600">{item?.description}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Pricing */}
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-orange-600" />
              <span className="font-semibold">{menu.basePrice}</span>
              <span className="text-gray-500 ml-1">per meal</span>
            </div>

            {/* Delivery details form */}
            {user?.role === "consumer" && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Delivery Address</Label>
                  <Input
                    placeholder="Enter your delivery address"
                    value={orderData.deliveryAddress}
                    onChange={(e) =>
                      setOrderData((prev) => ({
                        ...prev,
                        deliveryAddress: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>Delivery Period</Label>
                  <Select
                    value={orderData.deliveryPeriod}
                    onValueChange={(value) =>
                      setOrderData((prev) => ({
                        ...prev,
                        deliveryPeriod: value as any,
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
                      <SelectItem value="custom_dates">Custom Dates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Specific Days */}
                {orderData.deliveryPeriod === "specific_days" && (
                  <div>
                    <Label>Select Days of the Week</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {getValidDays(menu.weeklyItems).map((day) => (
                        <Button
                          key={day}
                          variant={
                            selectedDays.includes(day) ? "default" : "outline"
                          }
                          className="text-sm capitalize"
                          onClick={() => toggleDay(day)}
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Dates */}
                {orderData.deliveryPeriod === "custom_dates" && (
                  <div>
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
                          disabled={(date) => {
                            const day = date.getDay();
                            const validDays = getValidDays(
                              menu.weeklyItems
                            ).map((d) => dayMap[d]);
                            return !validDays.includes(day);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div>
                  <Label>Special Instructions (Optional)</Label>
                  <Textarea
                    placeholder="Any special requests or notes"
                    value={orderData.notes}
                    onChange={(e) =>
                      setOrderData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isOrdering ? "Processing..." : "Place Order"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
