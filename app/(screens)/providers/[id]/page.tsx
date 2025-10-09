"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
}

interface WeeklyMenu {
  monday?: MenuItem;
  tuesday?: MenuItem;
  wednesday?: MenuItem;
  thursday?: MenuItem;
  friday?: MenuItem;
  saturday?: MenuItem;
  sunday?: MenuItem;
}

interface Menu {
  _id: string;
  name: string;
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  weeklyItems: WeeklyMenu;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl?: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: "whole" | "weekdays" | "weekends";
  rating: number;
}

interface ServiceProvider {
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

interface CartItem extends Menu {
  quantity: number;
}

export default function ProviderPage({ params }: { params: { id: string } }) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderData, setOrderData] = useState({
    deliveryAddress: "",
    deliveryDate: "",
    timeSlot: "",
    notes: "",
  });
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
      setProvider(data.provider);
    }
  };

  const fetchMenus = async () => {
    const res = await fetch(`/api/menus?providerId=${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setMenus(data.menus);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    const res = await fetch(`/api/reviews?providerId=${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews);
    }
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
        await fetch(`/api/favorites?providerId=${params.id}`, {
          method: "DELETE",
        });
        setIsFavorite(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerId: params.id }),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (menu: Menu) => {
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
            <CardDescription>by {provider.userId.name}</CardDescription>
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
                <TabsTrigger value="menu">Menu</TabsTrigger>
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
                        <Mail className="h-4 w-4" /> {provider.userId.email}
                      </div>
                      {provider.userId.phone && (
                        <div className="flex gap-2 items-center">
                          <Phone className="h-4 w-4" /> {provider.userId.phone}
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
                          className="flex justify-between items-center border-b py-2"
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
                      <div className="flex justify-between font-bold mt-4">
                        <span>Total</span>
                        <span>₹{getCartTotal()}</span>
                      </div>
                      <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                        Proceed to Pay
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
