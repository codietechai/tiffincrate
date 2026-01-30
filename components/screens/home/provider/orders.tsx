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
  Bike,
  MapPin,
  User,
  Phone,
  Utensils,
  Receipt,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatsGrid from "@/components/common/stats-grid";
import { LoadingPage } from "@/components/ui/loading";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  day?: string;
  images?: string[];
}

interface APIOrder {
  _id: string;
  deliveryStatus: string;
  deliveryDate: string;


  createdAt: string;
  updatedAt: string;
  order: {
    _id: string;
    consumerId: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    timeSlot: string;
    notes: string;
    deliveryAddress?: { address: string };
    items?: Array<{ name: string; quantity: number }>;
  };
  consumer?: Array<{ name: string }>;
  menu?: any[];
  menuitems?: MenuItem[];
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: any[];
  menu?: any[];
  menuitems?: MenuItem[];
  deliverySlot: string;
  status: "confirmed" | "ready" | "assigned" | "out_for_delivery" | "delivered";
  time: string;
  paymentMethod: string;
  address: string;
  phone: string;
  totalAmount?: number;
  notes?: string;
  timeSlot?: string;
  deliveryPartner?: string;
  deliveryType: "self" | "partner";
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const deliveryPartners = [
    "Suresh (Partner)",
    "Rajesh (Partner)",
    "Amit (Partner)",
    "Self Delivery",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      const transformedOrders: Order[] = data.orders.map((o: APIOrder) => ({
        id: o._id,
        orderNumber: `#ORD-${o._id.slice(-5)}`,
        customer:
          o.consumer?.[0]?.name || o.order.consumerId || "Unknown Customer",
        items: o.order.items || [],
        menu: o.menu || [],
        menuitems: o.menuitems || [],
        totalAmount: o.order.totalAmount || 0,
        notes: o.order.notes || "",
        timeSlot: o.order.timeSlot || "N/A",
        deliverySlot: new Date(o.deliveryDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: mapDeliveryStatus(o.deliveryStatus),
        time: new Date(o.createdAt).toLocaleDateString(),
        paymentMethod: o.order.paymentMethod || "N/A",
        address: o.order.deliveryAddress?.address || "N/A",
        phone: "N/A",
        deliveryType: "partner",
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const mapDeliveryStatus = (status: string) => {
    const map: Record<string, Order["status"]> = {
      pending: "confirmed",
      confirmed: "ready",
      ready: "ready",
      assigned: "assigned",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
    };
    return map[status] || "confirmed";
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-700",
      ready: "bg-green-100 text-green-700",
      assigned: "bg-purple-100 text-purple-700",
      out_for_delivery: "bg-orange-100 text-orange-700",
      delivered: "bg-gray-100 text-gray-700",
    };
    return colors[status];
  };

  const getStatusIcon = (status: Order["status"]) => {
    const icons = {
      confirmed: Clock,
      ready: Package,
      assigned: User,
      out_for_delivery: Bike,
      delivered: CheckCircle2,
    };
    const Icon = icons[status];
    return <Icon className="w-4 h-4" />;
  };

  const getStatusLabel = (status: Order["status"]) => {
    const labels = {
      confirmed: "Confirmed",
      ready: "Ready for Pickup",
      assigned: "Assigned",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
    };
    return labels[status];
  };

  const updateDeliveryOrderStatus = async (
    orderDeliveryId: string,
    status: string
  ) => {
    try {
      const res = await fetch(
        `/api/delivery-orders?orderDeliveryId=${orderDeliveryId}&status=${status}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": "provider",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      await fetchOrders();
    } catch (error) {
      console.error("❌ Error updating delivery order:", error);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    await updateDeliveryOrderStatus(orderId, newStatus);
  };

  const handleAssignPartner = (orderId: string, partner: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
            ...order,
            deliveryPartner: partner,
            deliveryType: partner === "Self Delivery" ? "self" : "partner",
            status: "assigned",
          }
          : order
      )
    );
  };

  const stats = [
    {
      label: "New Orders",
      value: orders.filter((o) => o.status === "confirmed").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Ready for Pickup",
      value: orders.filter((o) => o.status === "ready").length,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Out for Delivery",
      value: orders.filter(
        (o) => o.status === "out_for_delivery"
      ).length,
      icon: Bike,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Total Today",
      value: orders.length,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const filterOrdersByStatus = (status?: Order["status"]) =>
    !status ? orders : orders.filter((order) => order.status === status);

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-all border-gray-100">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base md:text-lg">
              {order.orderNumber}
            </CardTitle>
            <p className="text-gray-500 text-sm">{order.customer}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-xs`}>
            <span className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {getStatusLabel(order.status)}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {order.menu && order.menu.length > 0 && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
            {order.menu[0].image && (
              <img
                src={order.menu[0].image}
                alt={order.menu[0].name}
                className="w-14 h-14 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-medium text-gray-800">
                🍱 {order.menu[0].name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {order.menu[0].category}
              </p>
            </div>
          </div>
        )}

        {order.menuitems && order.menuitems.length > 0 && (
          <div className="space-y-2 bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="font-medium text-gray-700">🍽 Menu Items:</p>
            {order.menuitems.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                {item.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  {item.day && (
                    <p className="text-xs text-gray-500 capitalize">
                      {item.day}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm text-orange-700">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Delivery: {order.deliverySlot}
          </span>
          <span className="font-medium">₹{order.totalAmount}</span>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          {order.status === "confirmed" && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusUpdate(order.id, "ready")}
            >
              <Package className="w-4 h-4 mr-2" /> Mark Ready
            </Button>
          )}

          {order.status === "ready" && (
            <div className="space-y-2">
              <Select
                onValueChange={(partner) =>
                  handleAssignPartner(order.id, partner)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign Partner..." />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPartners.map((partner) => (
                    <SelectItem key={partner} value={partner}>
                      {partner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusUpdate(order.id, "out_for_delivery")}
              >
                <Bike className="w-4 h-4 mr-2" /> Start Self Delivery
              </Button>
            </div>
          )}

          {order.status === "out_for_delivery" && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleStatusUpdate(order.id, "delivered")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Delivered
            </Button>
          )}

          {order.status === "delivered" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm text-green-700 font-medium">
                ✓ Delivered Successfully
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <LoadingPage />;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <StatsGrid stats={stats} isLoading={loading} />

      <Tabs defaultValue="all">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="confirmed">
            New ({filterOrdersByStatus("confirmed").length})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready ({filterOrdersByStatus("ready").length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned ({filterOrdersByStatus("assigned").length})
          </TabsTrigger>
          <TabsTrigger value="out_for_delivery">
            Delivering ({filterOrdersByStatus("out_for_delivery").length})
          </TabsTrigger>
        </TabsList>

        {["all", "confirmed", "ready", "assigned", "out_for_delivery"].map(
          (tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {filterOrdersByStatus(
                tab === "all" ? undefined : (tab as Order["status"])
              ).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
