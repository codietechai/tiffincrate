"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  User,
  IndianRupee,
  Navigation,
  Eye,
} from "lucide-react";
import StatsGrid from "@/components/common/stats-grid";
import { LoadingPage } from "@/components/ui/loading";
import { useRouter } from "next/navigation";
import { PAGE_LINKS } from "@/constants/page-links";
import { API_ROUTES } from "@/constants/api-routes";

interface Order {
  _id: string;
  consumerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  menuId: {
    _id: string;
    name: string;
    description?: string;
    category: string;
  };
  address: {
    _id: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    pincode: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  timeSlot: string;
  orderType: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function ProviderOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch(API_ROUTES.AUTH.ME);
      if (response.ok) {
        const data = await response.json();
        if (data.data.role !== "provider") {
          router.push(PAGE_LINKS.HOME);
          return;
        }
        setUser(data.data);
      } else {
        router.push(PAGE_LINKS.AUTH.LOGIN);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push(PAGE_LINKS.AUTH.LOGIN);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.ORDER.BASE, {
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      delivered: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle2,
      preparing: Package,
      ready: Package,
      delivered: CheckCircle2,
      cancelled: Clock,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Confirmed",
      value: orders.filter((o) => o.status === "confirmed").length,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Delivered",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Cancelled",
      value: orders.filter((o) => o.status === "cancelled").length,
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const filterOrdersByStatus = (status?: string) =>
    !status ? orders : orders.filter((order) => order.status === status);

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-all border-gray-100">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base md:text-lg">
              Order #{order._id.slice(-8)}
            </CardTitle>
            <p className="text-gray-500 text-sm">{order.consumerId.name}</p>
            <p className="text-gray-400 text-xs">{order.consumerId.email}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-xs`}>
            <span className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status}</span>
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Menu Information */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{order.menuId.name}</p>
            <p className="text-xs text-gray-500 capitalize">{order.menuId.category}</p>
            {order.menuId.description && (
              <p className="text-xs text-gray-400 truncate">{order.menuId.description}</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium capitalize">{order.timeSlot}</p>
              <p className="text-gray-500 text-xs capitalize">{order.orderType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium">₹{order.totalAmount}</p>
              <p className="text-gray-500 text-xs capitalize">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-gray-700">
              {order.address.addressLine1}
              {order.address.addressLine2 && `, ${order.address.addressLine2}`}
            </p>
            <p className="text-gray-500 text-xs">
              {order.address.city} - {order.address.pincode}
            </p>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Notes:</strong> {order.notes}
            </p>
          </div>
        )}

        {/* Order Date */}
        <div className="text-xs text-gray-500 border-t pt-3">
          Ordered on {new Date(order.createdAt).toLocaleDateString()} at{" "}
          {new Date(order.createdAt).toLocaleTimeString()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(PAGE_LINKS.PROVIDER_ORDER_DETAIL(order._id))}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(PAGE_LINKS.DASHBOARD.DELIVERY)}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <LoadingPage />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <p className="text-gray-500 text-sm">Manage your recent orders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(PAGE_LINKS.PROVIDER_ORDERS)}
          >
            View All Orders
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(PAGE_LINKS.PROVIDER_DELIVERY_ORDERS)}
          >
            Today's Deliveries
          </Button>
        </div>
      </div>

      <StatsGrid stats={stats} isLoading={loading} />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({filterOrdersByStatus("confirmed").length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({filterOrdersByStatus("delivered").length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({filterOrdersByStatus("cancelled").length})
          </TabsTrigger>
        </TabsList>

        {["all", "confirmed", "delivered", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {filterOrdersByStatus(tab === "all" ? undefined : tab).length > 0 ? (
              filterOrdersByStatus(tab === "all" ? undefined : tab)
                .slice(0, 5) // Show only recent 5 orders
                .map((order) => <OrderCard key={order._id} order={order} />)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No {tab === "all" ? "" : tab} orders found</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {orders.length > 5 && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => router.push(PAGE_LINKS.PROVIDER_ORDERS)}
          >
            View All {orders.length} Orders
          </Button>
        </div>
      )}
    </div>
  );
}
