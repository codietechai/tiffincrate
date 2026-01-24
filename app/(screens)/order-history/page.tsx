"use client";
import { Package, Truck, Clock, Wallet, BoxIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Star, RotateCcw } from "lucide-react";
import TitleHeader from "@/components/common/title-header";
import BackHeader from "@/components/common/back-header";

interface Order {
  _id: string;
  menuId: any;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  deliveryDate: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    router.push(`/providers/${order.menuId.providerId}`);
  };

  return (
    <div className="min-h-screen">
      <BackHeader />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TitleHeader
          title="Your Orders"
          description="Track your orders"
          icon={<BoxIcon />}
        />

        <div className="relative mb-6 max-w-lg md:mx-0">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by restaurant or dish"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div
                    className="flex gap-3 cursor-pointer"
                    onClick={() => router.push(`/order-detail/${order._id}`)}
                  >
                    <img
                      src={
                        order?.menuId?.image ||
                        "https://dummyimage.com/100x100/eee/aaa&text=Food"
                      }
                      alt={order?.menuId?.name || "food"}
                      className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                    />

                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900 text-sm md:text-base">
                        {order?.menuId?.name || "Unknown Provider"}
                      </h2>
                      <p className="text-gray-500 text-xs md:text-sm">
                        {order?.menuId?.providerId?.businessName}
                      </p>

                      <p
                        className="text-red-500 text-xs font-medium cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/new-menu-item/${order.menuId._id}`);
                        }}
                      >
                        View menu
                      </p>

                      <div className="mt-2 text-sm text-gray-700">
                        <p className="text-xs text-gray-500">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {/* <p className="text-xs text-green-600 font-medium">
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </p> */}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-sm md:text-base">
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center border-t pt-2">
                    <div className="flex text-yellow-400 text-sm gap-1">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => {
                          const starValue = i + 1;
                          const currentRating = ratings[order._id] || 0;
                          const currentHover = hoverRatings[order._id] || 0;

                          return (
                            <Star
                              key={i}
                              className={`h-5 w-5 cursor-pointer transition-colors ${
                                starValue <= (currentHover || currentRating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                setHoverRatings((prev) => ({
                                  ...prev,
                                  [order._id]: starValue,
                                }));
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                setHoverRatings((prev) => ({
                                  ...prev,
                                  [order._id]: 0,
                                }));
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRatings((prev) => ({
                                  ...prev,
                                  [order._id]: starValue,
                                }));
                                console.log(
                                  "⭐ Selected Rating:",
                                  starValue,
                                  "for Order ID:",
                                  order._id,
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {order.status === "delivered" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1 text-xs md:text-sm"
                        onClick={() => handleReorder(order)}
                      >
                        <RotateCcw className="h-4 w-4" /> Reorder
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="text-xs md:text-sm"
                      >
                        Currently not delivering
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try a different search term"
                  : "You haven't placed any orders yet"}
              </p>
              <Button asChild>
                <a href="/browse-providers">Browse Providers</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
