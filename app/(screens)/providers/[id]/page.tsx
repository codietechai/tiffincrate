"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Star,
  Heart,
  MapPin,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
  Leaf,
  Phone,
  Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import clsx from "clsx";
import { MenuService } from "@/services/menu-service";
import { ReviewService } from "@/services/review-service";
import { TMenu } from "@/types";

export interface TServiceProvider {
  _id: string;
  businessName: string;
  description: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  operatingHours: { start: string; end: string };
  userId: { name: string; email: string; phone?: string };
}

export interface CartItem extends TMenu {
  quantity: number;
}

export default function ProviderPage({ params }: { params: { id: string } }) {
  const [provider, setProvider] = useState<TServiceProvider | null>(null);
  const [menus, setMenus] = useState<TMenu[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOrdering, setIsOrdering] = useState(false);
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
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchProvider();
    fetchMenus();
    fetchReviews();
  }, [params.id]);

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

  const fetchProvider = async () => {
    const res = await fetch(`/api/providers/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setProvider(data.data);
    }
  };

  const fetchMenus = async () => {
    const res = await MenuService.fetchMenus(params.id);
    setMenus(res?.data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const res = await ReviewService.fetchReviews({ id: params.id });
    setReviews(res.data);
  };

  const checkFavoriteStatus = async () => {
    const res = await fetch("/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setIsFavorite(data.favorites.some((f: any) => f._id === params.id));
    }
  };

  const toggleFavorite = async () => {
    if (!user || user.role !== "consumer") return;
    try {
      if (isFavorite) {
        const response = await fetch(`/api/favorites?providerId=${params.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerId: params.id }),
        });
        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (menu: TMenu) => {
    setCart((prev) => {
      const existing = prev.find((m) => m._id === menu._id);
      if (existing)
        return prev.map((m) =>
          m._id === menu._id ? { ...m, quantity: m.quantity + 1 } : m
        );
      return [...prev, { ...menu, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((m) => m._id === id);
      if (existing && existing.quantity > 1)
        return prev.map((m) =>
          m._id === id ? { ...m, quantity: m.quantity - 1 } : m
        );
      return prev.filter((m) => m._id !== id);
    });
  };

  const getCartTotal = () =>
    cart.reduce((t, m) => t + m.basePrice * m.quantity, 0);

  const getCartItemCount = () => cart.reduce((t, m) => t + m.quantity, 0);

  const getItemQuantityInCart = (id: string) =>
    cart.find((m) => m._id === id)?.quantity ?? 0;

  const getAllCategories = () => {
    const categories = new Set<string>();
    menus.forEach((m) => categories.add(m.category));
    return Array.from(categories);
  };

  const getFilteredMenus = () => {
    if (selectedCategory === "all") return menus;
    return menus.filter((m) => m.category === selectedCategory);
  };

  const handlePlaceOrder = () => {};

  //  const handlePlaceOrder = async () => {
  //   if (!user || user.role !== "consumer") {
  //     router.push("/auth/login");
  //     return;
  //   }

  //   if (cart.length === 0) {
  //     alert("Please add items to cart");
  //     return;
  //   }

  //   if (!orderData.deliveryAddress || !orderData.deliveryDate) {
  //     alert("Please fill in delivery details");
  //     return;
  //   }

  //   setIsOrdering(true);

  //   try {
  //     // Step 1: Create Razorpay order on backend
  //     const razorpayResponse = await fetch("/api/razorpay/create-order", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         amount: getCartTotal(),
  //         currency: "INR",
  //       }),
  //     });

  //     const razorpayOrder = await razorpayResponse.json();
  //     if (!razorpayResponse.ok) throw new Error(razorpayOrder.error);
  //     console.log(295, razorpayOrder);
  //     const options = {
  //       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  //       amount: razorpayOrder.order.amount,
  //       currency: razorpayOrder.order.currency,
  //       name: "TiffinCrate",
  //       description: `Order from ${provider?.businessName}`,
  //       order_id: razorpayOrder.order.id,
  //       handler: async (response: any) => {
  //         console.log("Razorpay Payment Success:", response);
  //         // response will have the 3 values
  //         // {
  //         //   razorpay_payment_id,
  //         //   razorpay_order_id,
  //         //   razorpay_signature
  //         // }

  //         const res = await fetch("/api/orders", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             providerId: params.id,
  //             items: cart.map((item) => ({
  //               menuItemId: item._id,
  //               name: item.name,
  //               price: item.price,
  //               quantity: item.quantity,
  //             })),
  //             totalAmount: getCartTotal(),
  //             deliveryAddress: orderData.deliveryAddress,
  //             deliveryDate: orderData.deliveryDate,
  //             timeSlot: orderData.timeSlot,
  //             paymentMethod: "razorpay",
  //             notes: orderData.notes,
  //             razorpayOrderId: response.razorpay_order_id,
  //             razorpayPaymentId: response.razorpay_payment_id,
  //             razorpaySignature: response.razorpay_signature,
  //           }),
  //         });

  //         const data = await res.json();
  //         console.log("Order Response:", data);
  //       },
  //       prefill: {
  //         name: user.name,
  //         email: user.email,
  //       },
  //       theme: { color: "#3B82F6" },
  //     };

  //     const razorpay = new (window as any).Razorpay(options);
  //     razorpay.open();
  //   } catch (error) {
  //     console.error("Error placing order:", error);
  //     alert("Failed to place order");
  //   } finally {
  //     setIsOrdering(false);
  //   }
  // };
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (loading) return <LoadingPage />;

  if (!provider)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>Provider not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
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
      setOrderData((prevOrder) => ({
        ...prevOrder,
        dates: updated.join(","),
      }));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Provider Info */}
        <Card className="mb-8 bg-gradient-to-r from-orange-100 to-yellow-100">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              {provider.businessName}
              {provider.isVerified && <Badge>Verified</Badge>}
            </CardTitle>
            <CardDescription>by {provider?.userId?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">{provider.description}</p>
            <div className="flex items-center gap-6 text-gray-500">
              <MapPin className="h-4 w-4" /> {provider.deliveryAreas.join(", ")}
              <Clock className="h-4 w-4" /> {provider.operatingHours.start}–
              {provider.operatingHours.end}
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />{" "}
              {provider.rating.toFixed(1)} ({reviews.length} reviews)
            </div>
          </CardContent>
        </Card>

        {/* Main */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menus */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="menu">
              <TabsList>
                <TabsTrigger value="menu">TMenu</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="menu">
                <div className="flex gap-2 flex-wrap mb-6">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All
                  </Button>
                  {getAllCategories().map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>

                {getFilteredMenus().map((menu) => (
                  <Card key={menu._id} className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {menu.name}
                        {menu.isVegetarian && (
                          <Leaf className="h-4 w-4 text-green-500" />
                        )}
                        {!menu.isAvailable && (
                          <Badge variant="destructive">Unavailable</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {menu.category.toUpperCase()} Plan ({menu.weekType})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {Object.entries(menu.weeklyItems).map(([day, item]) =>
                          item ? (
                            <div
                              key={day}
                              className="p-3 border rounded-md bg-white"
                            >
                              <h4 className="capitalize font-medium">{day}</h4>
                              <p className="text-sm text-gray-600">
                                {item.name}
                              </p>
                            </div>
                          ) : (
                            <div
                              key={day}
                              className="p-3 border rounded-md text-gray-400 text-sm"
                            >
                              {day}: No item
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">₹{menu.basePrice}</p>
                          {menu.monthlyPlanPrice && (
                            <p className="text-sm text-gray-600">
                              Monthly Plan: ₹{menu.monthlyPlanPrice}
                            </p>
                          )}
                        </div>
                        {menu.isAvailable &&
                          (getItemQuantityInCart(menu._id) > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(menu._id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span>{getItemQuantityInCart(menu._id)}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(menu)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => addToCart(menu)}>
                              Add To Cart
                            </Button>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews">
                {reviews.length ? (
                  reviews.map((r) => (
                    <Card key={r._id} className="mb-3">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{r.consumerId.name}</p>
                          <span className="text-sm text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < r.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {r.comment && (
                          <p className="text-gray-600">{r.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No reviews yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Mail className="h-4 w-4" /> {provider.userId?.email}
                      </div>
                      {provider.userId?.phone && (
                        <div className="flex gap-2 items-center">
                          <Phone className="h-4 w-4" /> {provider.userId?.phone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Cart */}
          {user?.role === "consumer" && (
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Order ({getCartItemCount()} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length ? (
                    <>
                      {cart.map((m) => (
                        <div
                          key={m._id}
                          className="flex justify-between items-center py-2"
                        >
                          <span>{m.name}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(m._id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span>{m.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(m)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
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
                      <div className="flex justify-between font-bold mb-4">
                        <span>Total</span>
                        <span>₹{getCartTotal()}</span>
                      </div>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={
                          isOrdering ||
                          !orderData.deliveryAddress ||
                          !orderData.deliveryDate
                        }
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        {isOrdering
                          ? "Processing..."
                          : `Place Order - ₹${getCartTotal()}`}
                      </Button>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-6">
                      Your cart is empty
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
