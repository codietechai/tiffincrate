"use client";
import { Package, Truck, Clock, Wallet } from "lucide-react";
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
import { LoadingPage } from "@/components/ui/loading";
import { Search, Star, RotateCcw } from "lucide-react";

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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

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
        const extracted = data.orders.map((o: any) => ({
          ...o,
          deliveryStatus: o.deliveryStatus,
          deliveryDate: o.deliveryDate,
        }));
        console.log("few", data);
        setOrders(extracted);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.menuId.providerId.businessName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by date range
    if (dateFilter) {
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= startDate
      );
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleReorder = async (order: Order) => {
    router.push(`/providers/${order.menuId.providerId}`);
  };

  const getTotalSpent = () => {
    return filteredOrders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((total, order) => total + order.totalAmount, 0);
  };

  const getOrderStats = () => {
    const total = filteredOrders.length;
    const delivered = filteredOrders.filter(
      (order) => order.status === "delivered"
    ).length;
    const cancelled = filteredOrders.filter(
      (order) => order.status === "cancelled"
    ).length;
    const pending = filteredOrders.filter(
      (order) => !["delivered", "cancelled"].includes(order.status)
    ).length;

    return { total, delivered, cancelled, pending };
  };

  if (loading) return <LoadingPage />;

  const stats = getOrderStats();

  const statsData = [
    {
      label: "Total Orders",
      value: stats.total,
      icon: Package,
      bgColor: "bg-blue-100",
      color: "text-blue-500",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      icon: Truck,
      bgColor: "bg-green-100",
      color: "text-green-500",
    },
    {
      label: "Active",
      value: stats.pending,
      icon: Clock,
      bgColor: "bg-yellow-100",
      color: "text-blue-500",
    },
    {
      label: "Total Spent",
      value: `₹${getTotalSpent().toLocaleString()}`,
      icon: Wallet,
      bgColor: "bg-purple-100",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Your Orders</h1>

        <div className="relative mb-6 max-w-lg mx-auto md:mx-0">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by restaurant or dish"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
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

                      {/* 🛠️ FIX: stop click from bubbling to parent */}
                      <p
                        className="text-red-500 text-xs font-medium cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation(); // 🚫 prevent parent click
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
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gray-300" />
                      ))}
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
