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
import BackHeader from "@/components/common/back-header";
import GoogleMapAutoComplete from "@/components/common/googlePlace";
import { MenuItemDetailSkeleton } from "./menu-detail-skeleton";
import { TAddress, TMenu } from "@/types";
import { AddressService } from "@/services/address-service";
import { AddressCard } from "../address/address-card";
import { OrderService } from "@/services/order-service";
import { MenuService } from "@/services/menu-service";
import { AuthService } from "@/services/auth-service";

interface IWeeklyMenu {
  monday?: { name: string; description: string };
  tuesday?: { name: string; description: string };
  wednesday?: { name: string; description: string };
  thursday?: { name: string; description: string };
  friday?: { name: string; description: string };
  saturday?: { name: string; description: string };
  sunday?: { name: string; description: string };
}

interface MenuItemDetailProps {
  onAddToCart: (item: any) => void;
}

const getValidDaysFromMenuItems = (menuItems: any[]) => {
  return menuItems.map((item) => item.day.toLowerCase());
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
  const [menu, setMenu] = useState<TMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<TAddress | null>(null);
  const [orderData, setOrderData] = useState({
    address: "",
    deliveryDate: "",
    deliveryPeriod: "month" as "month" | "specific_days" | "custom_dates",
    dates: "",
    recurring: undefined as number | undefined,
    timeSlot: "",
    notes: "",
  });

  const fetchDefaultAddress = async () => {
    try {
      const response = await AddressService.fetchDefault();
      setDefaultAddress(response.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchDefaultAddress();
  }, []);

  const [multiDates, setMultiDates] = useState<Date[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

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
      const res = await MenuService.fetchMenu(params.id as string);
      setMenu(res?.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await AuthService.checkAuth();
      setUser(res.data);
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

  if (loading) return <MenuItemDetailSkeleton />;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!menu) return <p className="p-6">No menu found.</p>;

  const handlePlaceOrder = async () => {
    if (!user || user.role !== "consumer") {
      router.push("/auth/login");
      return;
    }

    const autoTimeSlot = menu?.category;
    setIsOrdering(true);

    try {
      let totalDays = 0;
      let deliveryInfo: any = { type: orderData.deliveryPeriod };

      if (orderData.deliveryPeriod === "month") {
        totalDays = 30;
        deliveryInfo.startDate = new Date().toISOString().split("T")[0];
      }
      if (orderData.deliveryPeriod === "specific_days") {
        const startDate = new Date();
        const endDate = getNextMonthSameDate();

        totalDays = selectedDays.reduce((sum, day) => {
          return sum + countDayOccurrencesBetween(day, startDate, endDate);
        }, 0);

        deliveryInfo.days = selectedDays;
        deliveryInfo.startDate = startDate.toISOString().split("T")[0];
        deliveryInfo.endDate = endDate.toISOString().split("T")[0];
      } else if (orderData.deliveryPeriod === "custom_dates") {
        totalDays = multiDates.length;
        deliveryInfo.dates = multiDates.map((date) =>
          date.toLocaleDateString("en-CA"),
        );
      }

      const totalAmount = menu.basePrice * totalDays;

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
        description: `${menu.name} - ${totalDays} meals × ₹${menu.basePrice}`,
        notes: {
          totalMeals: totalDays,
          pricePerMeal: menu.basePrice,
        },
        name: "TiffinCrate",
        order_id: razorpayOrder.order.id,
        handler: async (response: any) => {
          await OrderService.placeOrder({
            menuId: menu._id,
            providerId: menu.providerId,
            totalAmount,
            address: defaultAddress?._id,
            orderType: orderData.deliveryPeriod,
            deliveryInfo,
            timeSlot: autoTimeSlot,
            paymentMethod: "razorpay",
            notes: orderData.notes,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          router.push("/track-orders");
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

  const onEdit = (addressId: string) =>
    router.push(`/address/edit/${addressId}?choose-another=true`);

  const validDays = getValidDaysFromMenuItems(menu.menuItems);

  const getNextMonthSameDate = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    if (nextMonth.getDate() !== today.getDate()) {
      nextMonth.setDate(0);
    }

    return nextMonth;
  };

  const countDayOccurrencesBetween = (
    day: string,
    startDate: Date,
    endDate: Date,
  ) => {
    const targetDay = dayMap[day.toLowerCase()];
    let count = 0;

    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      if (current.getDay() === targetDay) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-28">
      <BackHeader />

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="rounded-none overflow-hidden rounded-b-xl">
          <div className="relative aspect-[16/10] bg-gray-100">
            {menu.image && (
              <Image
                height={420}
                width={672}
                src={menu.image}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            )}
            {menu.isVegetarian ? (
              <Badge className="absolute top-4 right-4" variant="success">
                Veg
              </Badge>
            ) : (
              <Badge className="absolute top-4 right-4" variant="destructive">
                Non-Veg
              </Badge>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-xl font-semibold mb-2">{menu.name}</h1>
              <p className="text-gray-600">{menu.description}</p>
            </div>

            <Separator />

            <Accordion type="single" collapsible className="space-y-2">
              {menu.menuItems.map((item: any, index: number) => (
                <AccordionItem key={item._id} value={item._id}>
                  <AccordionTrigger className="capitalize font-medium">
                    {item.day}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">{item.description}</p>

                    <div className="flex gap-2 mt-2">
                      {(item.images || item.imageUrl || []).map(
                        (img: string, idx: number) => (
                          <Image
                            key={idx}
                            src={img}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded object-cover"
                          />
                        ),
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-orange-600" />
              <span className="font-semibold">{menu.basePrice}</span>
              <span className="text-gray-500 ml-1">per meal</span>
            </div>

            {user?.role === "consumer" && (
              <div className="space-y-4 mt-4">
                <div className="">
                  <Label>Default Address</Label>
                  <AddressCard
                    chooseAnother={() =>
                      router.push("/address?choose-another=true")
                    }
                    onEdit={onEdit}
                    address={defaultAddress}
                  />
                </div>
                <div>
                  <Label>Delivery Period</Label>
                  <Select
                    value={orderData.deliveryPeriod}
                    onValueChange={(value) => {
                      setOrderData((prev) => ({
                        ...prev,
                        deliveryPeriod: value as any,
                        dates: "",
                        recurring: undefined,
                      }));
                      setSelectedDays([]);
                      setMultiDates([]);
                    }}
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

                {orderData.deliveryPeriod === "specific_days" && (
                  <div>
                    <Label>Select Days</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {getValidDaysFromMenuItems(menu.menuItems).map((day) => (
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
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const day = date.getDay();
                            const allowedDayIndexes = validDays.map(
                              (d) => dayMap[d],
                            );
                            return (
                              date < today || !allowedDayIndexes.includes(day)
                            );
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
